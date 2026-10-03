import { describe, expect, it } from 'vitest'
import { samplePlan, sampleLog } from '../test/fixtures'
import {
  hasDeadheadLeg,
  partsFromSegments,
  partsFromTotals,
  routeTitleParts,
  stopKindsPresent,
  sumDutyHours,
} from './duty'

describe('duty helpers', () => {
  it('sums hours by status across days', () => {
    const totals = sumDutyHours([sampleLog, sampleLog])
    expect(totals.driving).toBeCloseTo(11.84)
    expect(totals.off_duty).toBeCloseTo(32.16)
  })

  it('drops statuses with no hours and keeps a fixed order', () => {
    const parts = partsFromTotals({ off_duty: 16, sleeper: 0, driving: 6, on_duty: 2 })
    expect(parts.map((part) => part.status)).toEqual(['driving', 'on_duty', 'off_duty'])
  })

  it('weights day segments by their share of 24 hours', () => {
    const parts = partsFromSegments(sampleLog.segments)
    expect(parts.reduce((sum, part) => sum + part.weight, 0)).toBeCloseTo(1)
    expect(parts[0]).toEqual({ status: 'off_duty', weight: 0.25 })
  })

  it('builds a trip title without repeating a pickup at the start', () => {
    expect(routeTitleParts(samplePlan.route.waypoints)).toEqual(['Richmond, VA', 'Newark, NJ'])
  })

  it('detects whether the truck must drive empty to the pickup', () => {
    expect(hasDeadheadLeg(samplePlan.route.waypoints)).toBe(false)
    const [current, pickup, dropoff] = samplePlan.route.waypoints
    expect(hasDeadheadLeg([current, { ...pickup, lat: 41.9 }, dropoff])).toBe(true)
  })

  it('collects the stop kinds present on a trip', () => {
    expect([...stopKindsPresent(samplePlan.stops)].sort()).toEqual(['dropoff', 'pickup', 'start'])
  })
})
