import { useEffect, useState } from 'react'
import { isAbortError } from '../api/client'
import { searchLocations } from '../api/trips'
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARACTERS, SEARCH_RESULT_LIMIT } from '../constants/limits'
import type { Place } from '../types/trip'
import { useDebouncedValue } from './useDebouncedValue'

export type SearchStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface SearchState {
  status: SearchStatus
  results: Place[]
}

interface Settled extends SearchState {
  key: string
}

const IDLE_STATE: SearchState = { status: 'idle', results: [] }
const resultCache = new Map<string, Place[]>()

function cacheKey(query: string): string {
  return query.toLowerCase()
}

export function useLocationSearch(query: string, enabled: boolean): SearchState {
  const debounced = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)
  const [settled, setSettled] = useState<Settled>({ key: '', ...IDLE_STATE })
  const active = enabled && debounced.length >= SEARCH_MIN_CHARACTERS
  const cached = active ? resultCache.get(cacheKey(debounced)) : undefined

  useEffect(() => {
    if (!active || cached) return
    const controller = new AbortController()
    searchLocations(debounced, SEARCH_RESULT_LIMIT, controller.signal)
      .then((results) => {
        resultCache.set(cacheKey(debounced), results)
        setSettled({ key: debounced, status: 'ready', results })
      })
      .catch((error: unknown) => {
        if (!isAbortError(error)) setSettled({ key: debounced, status: 'error', results: [] })
      })
    return () => controller.abort()
  }, [active, cached, debounced])

  if (!active) return IDLE_STATE
  if (cached) return { status: 'ready', results: cached }
  if (settled.key === debounced) return settled
  return { status: 'loading', results: settled.results }
}
