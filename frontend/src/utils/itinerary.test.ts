import { describe, expect, it } from 'vitest'
import type { Stop } from '../types/trip'
import { buildDayEntries, listDays, ongoingStop } from './itinerary'

function stop(id: number, kind: Stop['kind'], mile: number, arrive: string, depart: string, day: number): Stop {
  return {
    id,
    kind,
    title: kind,
    location: `Place ${id}`,
    lat: 0,
    lng: 0,
    mile,
    arrive,
    depart,
    duration_minutes: 30,
    day_number: day,
  }
}

const stops: Stop[] = [
  stop(0, 'start', 0, '2026-10-05T08:00:00', '2026-10-05T08:00:00', 1),
  stop(1, 'break', 440, '2026-10-05T16:00:00', '2026-10-05T16:30:00', 1),
  stop(2, 'rest', 605, '2026-10-05T19:30:00', '2026-10-06T05:30:00', 1),
  stop(3, 'fuel', 999, '2026-10-06T12:40:00', '2026-10-06T13:10:00', 2),
]

describe('itinerary entries', () => {
  it('lists every log day, including days without stops', () => {
    expect(listDays(3)).toEqual([1, 2, 3])
  })

  it('finds the stop that spans a day with no new stops', () => {
    expect(ongoingStop(stops, '2026-10-06T00:00:00')?.kind).toBe('rest')
    expect(ongoingStop(stops, '2026-10-05T00:00:00')).toBeUndefined()
  })

  it('puts a drive leg between consecutive stops of a day', () => {
    const entries = buildDayEntries(stops, 1)
    expect(entries.map((entry) => entry.kind)).toEqual(['stop', 'drive', 'stop', 'drive', 'stop'])
    const firstDrive = entries[1]
    expect(firstDrive).toMatchObject({ kind: 'drive', miles: 440, minutes: 480 })
  })

  it('starts a later day with the drive that follows the overnight rest', () => {
    const entries = buildDayEntries(stops, 2)
    expect(entries[0]).toMatchObject({ kind: 'drive', miles: 394, minutes: 430 })
    expect(entries[1]).toMatchObject({ kind: 'stop' })
  })

  it('skips drive legs between stops at the same place', () => {
    const same = [stop(0, 'start', 0, '2026-10-05T06:00:00', '2026-10-05T06:00:00', 1), stop(1, 'pickup', 0, '2026-10-05T06:00:00', '2026-10-05T07:00:00', 1)]
    expect(buildDayEntries(same, 1).map((entry) => entry.kind)).toEqual(['stop', 'stop'])
  })
})
