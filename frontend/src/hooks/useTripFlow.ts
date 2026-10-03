import { useCallback, useRef, useState } from 'react'
import type { TripRequestPayload } from '../types/trip'
import { withViewTransition } from '../utils/viewTransition'
import { useTripForm } from './useTripForm'
import { useTripPlanner } from './useTripPlanner'

type Screen = 'plan' | 'results'

function useEditor(clearError: () => void) {
  const [editing, setEditing] = useState(false)
  const openEditor = () => setEditing(true)
  const closeEditor = () => {
    setEditing(false)
    clearError()
  }
  return { editing, setEditing, openEditor, closeEditor }
}

function useScreen() {
  const [screen, setScreen] = useState<Screen>('plan')
  const [resultsKey, setResultsKey] = useState(0)
  const goTo = useCallback((next: Screen) => withViewTransition(() => setScreen(next)), [])
  const showNewResults = useCallback(() => {
    setResultsKey((key) => key + 1)
    goTo('results')
  }, [goTo])
  return { screen, resultsKey, goTo, showNewResults }
}

export function useTripFlow() {
  const { status, plan, error, submit, clearError, reset } = useTripPlanner()
  const { screen, resultsKey, goTo, showNewResults } = useScreen()
  const { editing, setEditing, ...editor } = useEditor(clearError)
  const lastPayload = useRef<TripRequestPayload | null>(null)

  const planAndShow = useCallback(
    async (payload: TripRequestPayload) => {
      lastPayload.current = payload
      const wasEditing = editing
      setEditing(false)
      const result = await submit(payload)
      if (result) showNewResults()
      else if (wasEditing) setEditing(true)
    },
    [submit, editing, setEditing, showNewResults],
  )
  const form = useTripForm((payload) => void planAndShow(payload))

  return {
    status,
    plan,
    error,
    form,
    editing,
    resultsKey,
    showingResults: screen === 'results' && plan !== null,
    ...editor,
    retry: () => lastPayload.current && void planAndShow(lastPayload.current),
    startOver: () => {
      form.reset()
      reset()
      goTo('plan')
    },
  }
}
