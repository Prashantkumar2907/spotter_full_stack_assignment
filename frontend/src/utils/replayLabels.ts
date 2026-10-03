import type { StopKind } from '../types/trip'
import { formatDuration } from './time'
import type { ReplayPhase } from './tripReplay'

const STOP_ACTIVITY: Record<StopKind, string> = {
  start: 'Starting out',
  pickup: 'Loading',
  dropoff: 'Unloading',
  fuel: 'Fueling',
  break: '30-minute break',
  rest: '10-hour rest',
  restart: '34-hour restart',
}

export interface ActivityLabel {
  title: string
  detail: string
  kind: StopKind | 'drive'
}

export function activityOf(phase: ReplayPhase, done = false): ActivityLabel {
  if (done && phase.kind === 'stop') return { title: 'Trip complete', detail: `Delivered to ${phase.stop.location}`, kind: 'dropoff' }
  if (phase.kind === 'drive') return { title: 'Driving', detail: `to ${phase.next.location}`, kind: 'drive' }
  const { stop } = phase
  const duration = stop.duration_minutes > 0 ? ` · ${formatDuration(stop.duration_minutes)}` : ''
  return { title: STOP_ACTIVITY[stop.kind], detail: `${stop.location}${duration}`, kind: stop.kind }
}

export function bubbleText(phase: ReplayPhase): string {
  if (phase.kind === 'drive') return ''
  const { stop } = phase
  const duration = stop.duration_minutes > 0 ? ` · ${formatDuration(stop.duration_minutes)}` : ''
  return `${STOP_ACTIVITY[stop.kind]}${duration}`
}
