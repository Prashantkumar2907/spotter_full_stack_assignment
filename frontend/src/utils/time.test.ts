import { describe, expect, it } from 'vitest'
import {
  formatDuration,
  formatElapsed,
  formatHours,
  formatMinuteOfDay,
  nextOccurrenceOfHour,
  nextQuarterHour,
  splitDate,
  toDateTimeLocal,
} from './time'

describe('formatMinuteOfDay', () => {
  it.each([
    [0, '12:00 AM'],
    [360, '6:00 AM'],
    [735, '12:15 PM'],
    [1135, '6:55 PM'],
    [1440, '12:00 AM'],
  ])('formats minute %i as %s', (minute, expected) => {
    expect(formatMinuteOfDay(minute)).toBe(expected)
  })
})

describe('durations', () => {
  it('formats minutes, hours and mixed durations', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(120)).toBe('2 h')
    expect(formatDuration(355)).toBe('5 h 55 min')
  })

  it('formats elapsed trip time with days', () => {
    expect(formatElapsed(475)).toBe('7 h 55 min')
    expect(formatElapsed(7763)).toBe('5 d 9 h')
    expect(formatElapsed(2880)).toBe('2 d')
  })

  it('formats hours with two decimals', () => {
    expect(formatHours(7.5)).toBe('7.50')
  })
})

describe('date helpers', () => {
  it('splits an ISO date without timezone drift', () => {
    expect(splitDate('2026-10-05')).toEqual({ year: '2026', month: '10', day: '05' })
  })

  it('formats a local datetime value', () => {
    expect(toDateTimeLocal(new Date(2026, 9, 5, 6, 5))).toBe('2026-10-05T06:05')
  })

  it('rounds up to the next quarter hour', () => {
    expect(nextQuarterHour(new Date(2026, 9, 5, 6, 1))).toBe('2026-10-05T06:15')
    expect(nextQuarterHour(new Date(2026, 9, 5, 6, 15))).toBe('2026-10-05T06:30')
    expect(nextQuarterHour(new Date(2026, 9, 5, 23, 50))).toBe('2026-10-06T00:00')
  })

  it('picks the next occurrence of an hour', () => {
    const now = new Date(2026, 9, 5, 9, 30)
    expect(nextOccurrenceOfHour(14, now)).toBe('2026-10-05T14:00')
    expect(nextOccurrenceOfHour(6, now)).toBe('2026-10-06T06:00')
  })
})
