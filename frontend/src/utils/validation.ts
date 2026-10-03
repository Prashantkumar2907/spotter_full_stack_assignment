import { MAX_CYCLE_HOURS } from '../constants/duty'
import type {
  FormErrors,
  LocationKey,
  LocationValue,
  TripFormValues,
} from '../types/form'
import type { LocationPayload, TripRequestPayload } from '../types/trip'

const LOCATION_KEYS: LocationKey[] = ['current', 'pickup', 'dropoff']
const LOCATION_ERROR = 'Enter a location'
const CYCLE_ERROR = `Use 0 to ${MAX_CYCLE_HOURS} hours`
const START_ERROR = 'Choose a departure time'

export function parseCycleHours(raw: string): number | null {
  if (raw.trim() === '') return null
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 && value <= MAX_CYCLE_HOURS ? value : null
}

function hasLocation(value: LocationValue): boolean {
  return value.place !== null || value.text.trim() !== ''
}

export function validateTripForm(values: TripFormValues): FormErrors {
  const errors: FormErrors = {}
  for (const key of LOCATION_KEYS) {
    if (!hasLocation(values[key])) errors[key] = LOCATION_ERROR
  }
  if (parseCycleHours(values.cycleUsed) === null) errors.cycleUsed = CYCLE_ERROR
  if (!values.startTime) errors.startTime = START_ERROR
  return errors
}

function toLocationPayload(value: LocationValue): LocationPayload {
  return value.place ?? value.text.trim()
}

export function toTripPayload(values: TripFormValues): TripRequestPayload {
  const entries = Object.entries(values.details).map(([key, text]) => [key, text.trim()])
  return {
    current_location: toLocationPayload(values.current),
    pickup_location: toLocationPayload(values.pickup),
    dropoff_location: toLocationPayload(values.dropoff),
    cycle_used_hours: parseCycleHours(values.cycleUsed) ?? 0,
    start_time: values.startTime,
    log_details: Object.fromEntries(entries.filter(([, text]) => text !== '')),
  }
}
