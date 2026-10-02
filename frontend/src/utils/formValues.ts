import type { TripExample } from '../constants/examples'
import type { LocationValue, LogDetailsValues, TripFormValues } from '../types/form'
import type { Place } from '../types/trip'
import { nextOccurrenceOfHour, nextQuarterHour } from './time'

export const EMPTY_LOCATION: LocationValue = { text: '', place: null }

export const EMPTY_DETAILS: LogDetailsValues = {
  driver_name: '',
  carrier_name: '',
  main_office_address: '',
  home_terminal_address: '',
  vehicle_numbers: '',
  shipping_document: '',
  commodity: '',
}

export function createInitialValues(now: Date = new Date()): TripFormValues {
  return {
    current: EMPTY_LOCATION,
    pickup: EMPTY_LOCATION,
    dropoff: EMPTY_LOCATION,
    cycleUsed: '0',
    startTime: nextQuarterHour(now),
    details: EMPTY_DETAILS,
  }
}

function locationFrom(place: Place): LocationValue {
  return { text: place.label, place }
}

export function valuesFromExample(example: TripExample, now: Date = new Date()): TripFormValues {
  return {
    current: locationFrom(example.current),
    pickup: locationFrom(example.pickup),
    dropoff: locationFrom(example.dropoff),
    cycleUsed: String(example.cycleUsed),
    startTime: nextOccurrenceOfHour(example.departureHour, now),
    details: example.details,
  }
}

export function clampCycleHours(value: number, max: number): string {
  const clamped = Math.min(max, Math.max(0, value))
  return String(Number(clamped.toFixed(2)))
}
