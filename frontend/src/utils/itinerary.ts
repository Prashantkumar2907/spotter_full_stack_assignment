import type { Stop } from '../types/trip'
import { parseNaiveIso } from './time'

const MS_PER_MINUTE = 60_000
const MIN_DRIVE_MILES = 1

export interface DriveLeg {
  kind: 'drive'
  key: string
  miles: number
  minutes: number
}

export interface StopEntry {
  kind: 'stop'
  key: string
  stop: Stop
}

export type ItineraryEntry = DriveLeg | StopEntry

export function listDays(dayCount: number): number[] {
  return Array.from({ length: dayCount }, (_, index) => index + 1)
}

export function ongoingStop(stops: Stop[], dayStart: string): Stop | undefined {
  const start = parseNaiveIso(dayStart).getTime()
  return stops.find(
    (stop) => parseNaiveIso(stop.arrive).getTime() < start && parseNaiveIso(stop.depart).getTime() > start,
  )
}

function minutesBetween(from: string, to: string): number {
  return Math.round((parseNaiveIso(to).getTime() - parseNaiveIso(from).getTime()) / MS_PER_MINUTE)
}

function driveBetween(previous: Stop, next: Stop): DriveLeg | null {
  const miles = next.mile - previous.mile
  if (miles < MIN_DRIVE_MILES) return null
  return {
    kind: 'drive',
    key: `drive-${previous.id}-${next.id}`,
    miles,
    minutes: minutesBetween(previous.depart, next.arrive),
  }
}

export function buildDayEntries(stops: Stop[], day: number): ItineraryEntry[] {
  const entries: ItineraryEntry[] = []
  stops.forEach((stop, index) => {
    if (stop.day_number !== day) return
    const leg = index > 0 ? driveBetween(stops[index - 1], stop) : null
    if (leg) entries.push(leg)
    entries.push({ kind: 'stop', key: `stop-${stop.id}`, stop })
  })
  return entries
}
