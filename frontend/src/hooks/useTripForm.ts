import { useCallback, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { TripExample } from '../constants/examples'
import type { LocationKey, LocationValue, TripFormValues } from '../types/form'
import type { LogDetails, TripRequestPayload } from '../types/trip'
import { createInitialValues, valuesFromExample } from '../utils/formValues'
import { toTripPayload, validateTripForm } from '../utils/validation'

type ScalarField = 'cycleUsed' | 'startTime'

export function useTripForm(onSubmit: (payload: TripRequestPayload) => void) {
  const [values, setValues] = useState<TripFormValues>(createInitialValues)
  const [attempted, setAttempted] = useState(false)
  const errors = useMemo(() => (attempted ? validateTripForm(values) : {}), [attempted, values])

  const setLocation = useCallback((key: LocationKey, value: LocationValue) => {
    setValues((current) => ({ ...current, [key]: value }))
  }, [])

  const setField = useCallback((key: ScalarField, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
  }, [])

  const setDetail = useCallback((key: keyof LogDetails, value: string) => {
    setValues((current) => ({ ...current, details: { ...current.details, [key]: value } }))
  }, [])

  const submit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      setAttempted(true)
      if (Object.keys(validateTripForm(values)).length === 0) onSubmit(toTripPayload(values))
    },
    [values, onSubmit],
  )

  const loadExample = useCallback(
    (example: TripExample) => {
      const next = valuesFromExample(example)
      setValues(next)
      setAttempted(false)
      onSubmit(toTripPayload(next))
    },
    [onSubmit],
  )

  return { values, errors, setLocation, setField, setDetail, submit, loadExample }
}

export type TripFormController = ReturnType<typeof useTripForm>
