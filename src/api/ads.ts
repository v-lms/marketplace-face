import { request } from './client'
import type {
  AdResponse,
  CreateAdPayload,
  MyAdsResponse,
  UpdateAdPayload,
} from './types'

export async function getAd(id: number): Promise<AdResponse> {
  return request<AdResponse>(`/ads/${id}`)
}

export async function listMyAds(
  params: { limit?: number; offset?: number } = {},
): Promise<MyAdsResponse> {
  return request<MyAdsResponse>('/ads/my', {
    query: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
    auth: true,
  })
}

export async function createAd(payload: CreateAdPayload): Promise<AdResponse> {
  return request<AdResponse>('/ads', {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export async function updateAd(id: number, payload: UpdateAdPayload): Promise<AdResponse> {
  return request<AdResponse>(`/ads/${id}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  })
}

export async function deleteAd(id: number): Promise<void> {
  await request<void>(`/ads/${id}`, {
    method: 'DELETE',
    auth: true,
  })
}
