import { ApiError } from '@/api/client'

export function formatApiError(err: unknown, fallback = 'Что-то пошло не так'): string {
  if (err instanceof ApiError) {
    if (typeof err.detail === 'string') return err.detail
    if (err.detail && typeof err.detail === 'object') {
      const d = err.detail as { detail?: unknown }
      if (typeof d.detail === 'string') return d.detail
      if (Array.isArray(d.detail)) {
        const first = d.detail[0] as { msg?: string } | undefined
        if (first?.msg) return first.msg
      }
    }
    return err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}
