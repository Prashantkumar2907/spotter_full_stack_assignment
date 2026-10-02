import type { LogDetails, Place } from './trip'

export interface LocationValue {
  text: string
  place: Place | null
}

export type LocationKey = 'current' | 'pickup' | 'dropoff'

export type LogDetailsValues = LogDetails

export interface TripFormValues {
  current: LocationValue
  pickup: LocationValue
  dropoff: LocationValue
  cycleUsed: string
  startTime: string
  details: LogDetailsValues
}

export type FormField = LocationKey | 'cycleUsed' | 'startTime'

export type FormErrors = Partial<Record<FormField, string>>
