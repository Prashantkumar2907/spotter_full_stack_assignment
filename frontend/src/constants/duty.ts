import type { StopKind } from '../types/trip'

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
