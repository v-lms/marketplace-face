import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMe, login as loginApi, logout as logoutApi, register as registerApi } from '@/api/auth'
import { ApiError, subscribeTokens } from '@/api/client'
import { loadTokens } from '@/api/tokens'
import { AuthContext, type AuthContextValue, type AuthState } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    status: loadTokens() ? 'loading' : 'anonymous',
  }))

  const refreshMe = useCallback(async () => {
    if (!loadTokens()) {
      setState({ user: null, status: 'anonymous' })
      return
    }
    try {
      const user = await fetchMe()
      setState({ user, status: 'authenticated' })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        logoutApi()
        setState({ user: null, status: 'anonymous' })
        return
      }
      throw err
    }
  }, [])

  useEffect(() => {
    void refreshMe()
  }, [refreshMe])

  useEffect(() => {
    return subscribeTokens(tokens => {
      if (!tokens) setState({ user: null, status: 'anonymous' })
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await loginApi({ email, password })
    await refreshMe()
  }, [refreshMe])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await registerApi({ name, email, password })
    await loginApi({ email, password })
    await refreshMe()
  }, [refreshMe])

  const logout = useCallback(() => {
    logoutApi()
    setState({ user: null, status: 'anonymous' })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, refreshMe }),
    [state, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
