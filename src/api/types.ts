export type AdStatus = 'active' | 'archived'

export interface AdResponse {
  id: number
  user_id: number
  user_name: string | null
  title: string
  description: string
  price: number
  category: string
  city: string
  status: AdStatus
  views: number
  created_at: string
  updated_at: string
}

export interface UserResponse {
  user_id: number
  name: string
  email: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface RegisterResponse {
  user_id: number
}

export type SearchSort = 'date' | 'price_asc' | 'price_desc'

export interface SearchQuery {
  q?: string
  category?: string
  city?: string
  min_price?: number
  max_price?: number
  sort?: SearchSort
  limit?: number
  offset?: number
}

export interface SearchHit {
  ad_id: number
  title: string
  description: string
  price: number
  category: string
  city: string
}

export interface SearchResponse {
  items: SearchHit[]
  total: number
  query: string
  limit: number
  offset: number
}

export interface SuggestResponse {
  suggestions: string[]
}

export interface MyAdsResponse {
  items: AdResponse[]
  total: number
}

export interface CreateAdPayload {
  title: string
  description: string
  price: number
  category: string
  city: string
}

export type UpdateAdPayload = Partial<CreateAdPayload>
