import { createContext } from 'react'
import type { UserResponse } from '@/api/types'

export interface AuthState {
  user: UserResponse | null
  status: 'loading' | 'authenticated' | 'anonymous'
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
