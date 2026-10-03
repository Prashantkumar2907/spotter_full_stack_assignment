import { describe, expect, it } from 'vitest'
import { samplePlan } from '../test/fixtures'
import type { Stop } from '../types/trip'
import type { LatLng } from './polyline'
import { activityOf, bubbleText } from './replayLabels'
import { STOP_DWELL_MS, buildReplay, cargoLoad, frameAt, stopFractions } from './tripReplay'

const [start, pickup, dropoff] = samplePlan.stops
const rest: Stop = {
  ...dropoff,
  id: 3,
  kind: 'rest',
  title: '10-hour rest',
  location: 'Baltimore, MD',
  lat: 39.29,
  lng: -76.61,
  mile: 150,
  arrive: '2026-10-05T10:00:00',
  depart: '2026-10-05T20:00:00',
  duration_minutes: 600,
}
const lateDropoff: Stop = { ...dropoff, arrive: '2026-10-05T23:00:00', depart: '2026-10-06T00:00:00' }
const stops = [start, pickup, rest, lateDropoff]
const path: LatLng[] = [
  [37.5385, -77.4343],
  [39.29, -76.61],
  [40.7357, -74.1724],
]

describe('trip replay', () => {
  it('places each stop on the route in order and ends at the drop-off', () => {
    const fractions = stopFractions(stops, path)
    expect(fractions[0]).toBe(0)
    expect(fractions[1]).toBe(0)
    expect(fractions[2]).toBeGreaterThan(0)
    expect(fractions[3]).toBe(1)
  })

  it('pauses at every stop and skips the empty drive when pickup is at the start', () => {
    const replay = buildReplay(stops, stopFractions(stops, path))
    expect(replay.phases.map((phase) => phase.kind)).toEqual(['stop', 'stop', 'drive', 'stop', 'drive', 'stop'])
    const restPhase = replay.phases[3]
    expect(restPhase.endMs - restPhase.startMs).toBe(STOP_DWELL_MS.rest)
    expect(replay.pickupAt).toBe(0)
  })

  it('moves the truck and the trip clock forward, then holds at the drop-off', () => {
    const replay = buildReplay(stops, stopFractions(stops, path))
    const drive = replay.phases[2]
    const middle = frameAt(replay, (drive.startMs + drive.endMs) / 2)
    expect(middle.phase.kind).toBe('drive')
    expect(middle.fraction).toBeGreaterThan(0)
    expect(middle.mile).toBeGreaterThan(0)
    expect(middle.clock).toBeGreaterThan(new Date(pickup.depart).getTime())
    const end = frameAt(replay, replay.totalMs + 1000)
    expect(end.done).toBe(true)
    expect(end.fraction).toBe(1)
    expect(end.mile).toBe(lateDropoff.mile)
  })

  it('describes what the driver is doing in plain words', () => {
    const replay = buildReplay(stops, stopFractions(stops, path))
    expect(activityOf(replay.phases[3])).toMatchObject({ title: '10-hour rest', detail: 'Baltimore, MD · 10 h' })
    expect(activityOf(replay.phases[2])).toMatchObject({ title: 'Driving', detail: 'to Baltimore, MD' })
    expect(bubbleText(replay.phases[1])).toBe('Loading · 1 h')
    expect(bubbleText(replay.phases[2])).toBe('')
    expect(activityOf(replay.phases[5], true).title).toBe('Trip complete')
  })

  it('loads the trailer at the pickup, keeps it full, and empties it at the drop-off', () => {
    const replay = buildReplay(stops, stopFractions(stops, path))
    const at = (index: number, share: number) => {
      const phase = replay.phases[index]
      return cargoLoad(replay, frameAt(replay, phase.startMs + (phase.endMs - phase.startMs) * share))
    }
    expect(at(0, 0.5)).toBe(0)
    expect(at(1, 0.5)).toBeCloseTo(0.5)
    expect(at(3, 0.5)).toBe(1)
    expect(at(5, 0.25)).toBeCloseTo(0.75)
    expect(cargoLoad(replay, frameAt(replay, replay.totalMs))).toBe(0)
  })
})
