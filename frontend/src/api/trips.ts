import type { Place, TripPlan, TripRequestPayload } from '../types/trip'
import { request } from './client'

interface SearchResponse {
  results: Place[]
}

export function planTrip(payload: TripRequestPayload, signal?: AbortSignal): Promise<TripPlan> {
  return request<TripPlan>('/api/trips/plan/', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  })
}

export async function searchLocations(
  query: string,
  limit: number,
  signal?: AbortSignal,
): Promise<Place[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) })
  const response = await request<SearchResponse>(`/api/locations/search/?${params}`, { signal })
  return response.results
}
