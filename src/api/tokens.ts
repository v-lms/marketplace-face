const ACCESS_KEY = 'market.access_token'
const REFRESH_KEY = 'market.refresh_token'

export interface TokenPair {
  access: string
  refresh: string
}

export function loadTokens(): TokenPair | null {
  const access = localStorage.getItem(ACCESS_KEY)
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!access || !refresh) return null
  return { access, refresh }
}

export function saveTokens(pair: TokenPair): void {
  localStorage.setItem(ACCESS_KEY, pair.access)
  localStorage.setItem(REFRESH_KEY, pair.refresh)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export interface JwtPayload {
  user_id: number
  email?: string
  type: 'access' | 'refresh'
  exp: number
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function isExpired(token: string, skewSeconds = 30): boolean {
  const p = decodeJwt(token)
  if (!p) return true
  const nowSec = Math.floor(Date.now() / 1000)
  return p.exp - skewSeconds <= nowSec
}
