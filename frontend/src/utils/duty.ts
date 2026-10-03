import { DUTY_STATUS_ORDER, MINUTES_PER_DAY } from '../constants/duty'
import type { DailyLog, DutyStatus, LogSegment, Stop, StopKind, Waypoint } from '../types/trip'

export interface DutyPart {
  status: DutyStatus
  weight: number
}

export function sumDutyHours(logs: DailyLog[]): Record<DutyStatus, number> {
  const totals: Record<DutyStatus, number> = { off_duty: 0, sleeper: 0, driving: 0, on_duty: 0 }
  for (const log of logs) {
    for (const status of DUTY_STATUS_ORDER) totals[status] += log.totals[status]
  }
  return totals
}

export function partsFromTotals(totals: Record<DutyStatus, number>): DutyPart[] {
  return DUTY_STATUS_ORDER.map((status) => ({ status, weight: totals[status] })).filter(
    (part) => part.weight > 0,
  )
}

export function partsFromSegments(segments: LogSegment[]): DutyPart[] {
  return segments.map((segment) => ({
    status: segment.status,
    weight: (segment.end_minute - segment.start_minute) / MINUTES_PER_DAY,
  }))
}

export function stopKindsPresent(stops: Stop[]): Set<StopKind> {
  return new Set(stops.map((stop) => stop.kind))
}

export function routeTitleParts(waypoints: Waypoint[]): string[] {
  return waypoints
    .map((waypoint) => waypoint.label)
    .filter((label, index, labels) => index === 0 || label !== labels[index - 1])
}

export function hasDeadheadLeg(waypoints: Waypoint[]): boolean {
  const [current, pickup] = waypoints
  return Boolean(current && pickup) && (current.lat !== pickup.lat || current.lng !== pickup.lng)
}
