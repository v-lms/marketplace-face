import { clearTokens, isExpired, loadTokens, saveTokens, type TokenPair } from './tokens'
import type { TokenResponse } from './types'

const API_PREFIX = '/api'

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, detail: unknown, message?: string) {
    super(message ?? (typeof detail === 'string' ? detail : `HTTP ${status}`))
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  query?: Record<string, string | number | undefined | null>
  auth?: boolean
  signal?: AbortSignal
}

type TokensListener = (tokens: TokenPair | null) => void

const listeners = new Set<TokensListener>()

export function subscribeTokens(listener: TokensListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emitTokens(tokens: TokenPair | null): void {
  listeners.forEach(l => l(tokens))
}

export function setTokens(tokens: TokenPair | null): void {
  if (tokens) saveTokens(tokens)
  else clearTokens()
  emitTokens(tokens)
}

// Pending-refresh promise, чтобы параллельные запросы не гоняли рефреш дважды
let refreshing: Promise<TokenPair | null> | null = null

async function refreshAccess(): Promise<TokenPair | null> {
  const current = loadTokens()
  if (!current) return null
  if (isExpired(current.refresh, 0)) {
    setTokens(null)
    return null
  }

  if (!refreshing) {
    refreshing = (async () => {
      try {
        const resp = await fetch(`${API_PREFIX}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: current.refresh }),
        })
        if (!resp.ok) {
          setTokens(null)
          return null
        }
        const data = (await resp.json()) as TokenResponse
        const next: TokenPair = { access: data.access_token, refresh: data.refresh_token }
        setTokens(next)
        return next
      } catch {
        setTokens(null)
        return null
      } finally {
        refreshing = null
      }
    })()
  }
  return refreshing
}

function buildQuery(query: RequestOptions['query']): string {
  if (!query) return ''
  const pairs: string[] = []
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue
    pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  }
  return pairs.length ? `?${pairs.join('&')}` : ''
}

async function doFetch(path: string, options: RequestOptions, access: string | null): Promise<Response> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (access) headers['Authorization'] = `Bearer ${access}`

  return fetch(`${API_PREFIX}${path}${buildQuery(options.query)}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const needAuth = options.auth ?? false
  let tokens = loadTokens()

  if (needAuth) {
    if (!tokens) throw new ApiError(401, 'Unauthorized', 'Unauthorized')
    if (isExpired(tokens.access)) {
      tokens = await refreshAccess()
      if (!tokens) throw new ApiError(401, 'Unauthorized', 'Unauthorized')
    }
  }

  let resp = await doFetch(path, options, tokens?.access ?? null)

  // Сервер мог вернуть 401 раньше нас (например, секрет поменяли) — пробуем один раз рефрешнуться
  if (resp.status === 401 && needAuth) {
    const next = await refreshAccess()
    if (next) {
      resp = await doFetch(path, options, next.access)
    }
  }

  if (resp.status === 204) {
    return undefined as T
  }

  if (!resp.ok) {
    let detail: unknown = null
    try {
      detail = await resp.json()
    } catch {
      /* ignore */
    }
    const message =
      detail && typeof detail === 'object' && 'detail' in detail && typeof (detail as { detail: unknown }).detail === 'string'
        ? ((detail as { detail: string }).detail)
        : `HTTP ${resp.status}`
    throw new ApiError(resp.status, detail, message)
  }

  const text = await resp.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
