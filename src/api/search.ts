import { request } from './client'
import type { SearchQuery, SearchResponse, SuggestResponse } from './types'

export async function searchAds(query: SearchQuery = {}): Promise<SearchResponse> {
  return request<SearchResponse>('/search', {
    query: {
      q: query.q,
      category: query.category,
      city: query.city,
      min_price: query.min_price,
      max_price: query.max_price,
      sort: query.sort,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    },
  })
}

export async function suggestTitles(prefix: string, limit?: number): Promise<SuggestResponse> {
  return request<SuggestResponse>('/search/suggest', {
    query: {
      q: prefix,
      limit,
    },
  })
}
