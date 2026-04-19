import { request, setTokens } from './client'
import type { RegisterResponse, TokenResponse, UserResponse } from './types'

export async function register(input: { name: string; email: string; password: string }): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', { method: 'POST', body: input })
}

export async function login(input: { email: string; password: string }): Promise<TokenResponse> {
  const tokens = await request<TokenResponse>('/auth/login', { method: 'POST', body: input })
  setTokens({ access: tokens.access_token, refresh: tokens.refresh_token })
  return tokens
}

export function logout(): void {
  setTokens(null)
}

export async function fetchMe(): Promise<UserResponse> {
  return request<UserResponse>('/auth/users/me', { auth: true })
}
