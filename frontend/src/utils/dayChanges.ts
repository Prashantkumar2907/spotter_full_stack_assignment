import type { DailyLog, DutyStatus } from '../types/trip'

const PADDING_START = 'before_trip'

export interface DutyChange {
  minute: number
  status: DutyStatus
  activity: string
  location: string
}

export function dutyChanges(log: DailyLog): DutyChange[] {
  const locations = new Map(log.remarks.map((remark) => [remark.minute, remark.location]))
  return log.segments
    .filter((segment) => segment.activity !== PADDING_START && locations.has(segment.start_minute))
    .map((segment) => ({
      minute: segment.start_minute,
      status: segment.status,
      activity: segment.activity,
      location: locations.get(segment.start_minute) ?? '',
    }))
}
