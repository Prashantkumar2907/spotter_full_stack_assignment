import { useCallback, useRef, useState } from 'react'
import { ApiError, isAbortError } from '../api/client'
import { planTrip } from '../api/trips'
import type { TripPlan, TripRequestPayload } from '../types/trip'

export type PlannerStatus = 'idle' | 'loading' | 'success' | 'error'

interface PlannerState {
  status: PlannerStatus
  plan: TripPlan | null
  error: ApiError | null
}

const INITIAL_STATE: PlannerState = { status: 'idle', plan: null, error: null }
const UNEXPECTED_MESSAGE = 'Something unexpected happened while planning the trip.'

function toApiError(error: unknown): ApiError {
  return error instanceof ApiError ? error : new ApiError(UNEXPECTED_MESSAGE, 0, 'unexpected_error')
}

export function useTripPlanner() {
  const [state, setState] = useState<PlannerState>(INITIAL_STATE)
  const controllerRef = useRef<AbortController | null>(null)

  const submit = useCallback(async (payload: TripRequestPayload): Promise<TripPlan | null> => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState((previous) => ({ ...previous, status: 'loading', error: null }))
    try {
      const plan = await planTrip(payload, controller.signal)
      setState({ status: 'success', plan, error: null })
      return plan
    } catch (error) {
      if (!isAbortError(error)) {
        setState((previous) => ({ ...previous, status: 'error', error: toApiError(error) }))
      }
      return null
    }
  }, [])

  const clearError = useCallback(() => {
    setState((previous) => (previous.status === 'error' ? { ...previous, status: previous.plan ? 'success' : 'idle', error: null } : previous))
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    setState(INITIAL_STATE)
  }, [])

  return { ...state, submit, clearError, reset }
}
