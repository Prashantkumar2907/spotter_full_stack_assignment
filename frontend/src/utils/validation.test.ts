import { describe, expect, it } from 'vitest'
import type { TripFormValues } from '../types/form'
import { createInitialValues, valuesFromExample } from './formValues'
import { TRIP_EXAMPLES } from '../constants/examples'
import { parseCycleHours, toTripPayload, validateTripForm } from './validation'

const place = { label: 'Richmond, VA', lat: 37.5, lng: -77.4 }

function filledValues(overrides: Partial<TripFormValues> = {}): TripFormValues {
  return {
    ...createInitialValues(new Date(2026, 9, 5, 6, 0)),
    current: { text: place.label, place },
    pickup: { text: 'Dallas', place: null },
    dropoff: { text: place.label, place },
    ...overrides,
  }
}

describe('parseCycleHours', () => {
  it.each([
    ['0', 0],
    ['12.5', 12.5],
    ['70', 70],
  ])('accepts %s', (raw, expected) => {
    expect(parseCycleHours(raw)).toBe(expected)
  })

  it.each(['', '  ', '-1', '70.5', 'abc'])('rejects %j', (raw) => {
    expect(parseCycleHours(raw)).toBeNull()
  })
})

describe('validateTripForm', () => {
  it('flags every empty required field on a blank form', () => {
    const errors = validateTripForm(createInitialValues())
    expect(Object.keys(errors).sort()).toEqual(['current', 'dropoff', 'pickup'])
  })

  it('accepts typed text that was not picked from the list', () => {
    expect(validateTripForm(filledValues())).toEqual({})
  })

  it('rejects out-of-range cycle hours and a missing departure', () => {
    const errors = validateTripForm(filledValues({ cycleUsed: '71', startTime: '' }))
    expect(errors.cycleUsed).toMatch(/0 and 70/)
    expect(errors.startTime).toBeDefined()
  })
})

describe('toTripPayload', () => {
  it('sends picked places as objects and typed text as strings', () => {
    const payload = toTripPayload(filledValues({ cycleUsed: '24.5' }))
    expect(payload.current_location).toEqual(place)
    expect(payload.pickup_location).toBe('Dallas')
    expect(payload.cycle_used_hours).toBe(24.5)
    expect(payload.start_time).toBe('2026-10-05T06:15')
  })

  it('drops blank log details and trims the rest', () => {
    const values = filledValues()
    values.details = { ...values.details, carrier_name: '  Acme  ' }
    expect(toTripPayload(values).log_details).toEqual({ carrier_name: 'Acme' })
  })
})

describe('examples', () => {
  it.each(TRIP_EXAMPLES)('"$title" produces a valid form', (example) => {
    expect(validateTripForm(valuesFromExample(example))).toEqual({})
  })
})
