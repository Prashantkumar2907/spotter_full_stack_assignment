import type { DutyStatus, StopKind } from '../types/trip'

export const DUTY_STATUS_ORDER: DutyStatus[] = ['driving', 'on_duty', 'sleeper', 'off_duty']

export const DUTY_STATUS_LABELS: Record<DutyStatus, string> = {
  off_duty: 'Off duty',
  sleeper: 'Sleeper berth',
  driving: 'Driving',
  on_duty: 'On duty',
}

export const DUTY_STATUS_COLORS: Record<DutyStatus, string> = {
  off_duty: 'var(--status-off-duty)',
  sleeper: 'var(--status-sleeper)',
  driving: 'var(--status-driving)',
  on_duty: 'var(--status-on-duty)',
}

export const STOP_KIND_LABELS: Record<StopKind, string> = {
  start: 'Start',
  pickup: 'Pickup',
  dropoff: 'Drop-off',
  fuel: 'Fuel stop',
  break: '30-minute break',
  rest: '10-hour rest',
  restart: '34-hour restart',
}

export const MAX_CYCLE_HOURS = 70
export const MINUTES_PER_HOUR = 60
export const MINUTES_PER_DAY = 1440
