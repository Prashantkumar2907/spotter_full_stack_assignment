import type { Stop, StopKind } from '../types/trip'
import type { LatLng } from './polyline'
import { easeInOut, measurePath } from './routeMotion'
import { parseNaiveIso } from './time'

const MS_PER_HOUR = 3_600_000
const DRIVE_MS_PER_HOUR = 420
const MIN_DRIVE_MS = 1400

export const STOP_DWELL_MS: Record<StopKind, number> = {
  start: 900,
  pickup: 1900,
  dropoff: 1900,
  fuel: 1300,
  break: 1300,
  rest: 2600,
  restart: 3200,
}

interface PhaseBase {
  startMs: number
  endMs: number
  fromTime: number
  toTime: number
}

export interface DrivePhase extends PhaseBase {
  kind: 'drive'
  from: number
  to: number
  fromMile: number
  toMile: number
  next: Stop
}

export interface StopPhase extends PhaseBase {
  kind: 'stop'
  at: number
  stop: Stop
}

export type ReplayPhase = DrivePhase | StopPhase

export interface Replay {
  phases: ReplayPhase[]
  totalMs: number
  totalMiles: number
  pickupAt: number
}

export interface ReplayFrame {
  phase: ReplayPhase
  ratio: number
  fraction: number
  clock: number
  mile: number
  progress: number
  done: boolean
}

function squaredDistance(a: LatLng, b: LatLng): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
}

function nearestIndex(path: LatLng[], point: LatLng, from: number): number {
  let best = from
  for (let index = from; index < path.length; index++) {
    if (squaredDistance(path[index], point) < squaredDistance(path[best], point)) best = index
  }
  return best
}

export function stopFractions(stops: Stop[], path: LatLng[]): number[] {
  if (path.length < 2) return stops.map(() => 0)
  const { cumulative, total } = measurePath(path)
  let from = 0
  return stops.map((stop, index) => {
    if (index === stops.length - 1) return 1
    from = nearestIndex(path, [stop.lat, stop.lng], from)
    return total > 0 ? cumulative[from] / total : 0
  })
}

const timeOf = (iso: string) => parseNaiveIso(iso).getTime()

function drivePhase(previous: Stop, stop: Stop, fractions: [number, number], startMs: number): DrivePhase | null {
  const fromTime = timeOf(previous.depart)
  const toTime = timeOf(stop.arrive)
  if (toTime <= fromTime && fractions[0] === fractions[1]) return null
  const duration = Math.max(MIN_DRIVE_MS, ((toTime - fromTime) / MS_PER_HOUR) * DRIVE_MS_PER_HOUR)
  return {
    kind: 'drive',
    startMs,
    endMs: startMs + duration,
    fromTime,
    toTime,
    from: fractions[0],
    to: fractions[1],
    fromMile: previous.mile,
    toMile: stop.mile,
    next: stop,
  }
}

function stopPhase(stop: Stop, at: number, startMs: number): StopPhase {
  return { kind: 'stop', startMs, endMs: startMs + STOP_DWELL_MS[stop.kind], fromTime: timeOf(stop.arrive), toTime: timeOf(stop.depart), at, stop }
}

export function buildReplay(stops: Stop[], fractions: number[]): Replay {
  const phases: ReplayPhase[] = []
  let cursor = 0
  stops.forEach((stop, index) => {
    const drive = index > 0 ? drivePhase(stops[index - 1], stop, [fractions[index - 1], fractions[index]], cursor) : null
    if (drive) {
      phases.push(drive)
      cursor = drive.endMs
    }
    const dwell = stopPhase(stop, fractions[index], cursor)
    phases.push(dwell)
    cursor = dwell.endMs
  })
  const pickup = stops.findIndex((stop) => stop.kind === 'pickup')
  return { phases, totalMs: cursor, totalMiles: stops.at(-1)?.mile ?? 0, pickupAt: pickup >= 0 ? fractions[pickup] : 0 }
}

function phaseAt(phases: ReplayPhase[], ms: number): ReplayPhase {
  return phases.find((phase) => ms < phase.endMs) ?? phases[phases.length - 1]
}

const lerp = (from: number, to: number, ratio: number) => from + (to - from) * ratio

export function frameAt(replay: Replay, elapsedMs: number): ReplayFrame {
  const ms = Math.min(Math.max(0, elapsedMs), replay.totalMs)
  const phase = phaseAt(replay.phases, ms)
  const ratio = phase.endMs > phase.startMs ? Math.min(1, (ms - phase.startMs) / (phase.endMs - phase.startMs)) : 1
  const clock = lerp(phase.fromTime, phase.toTime, ratio)
  const progress = replay.totalMs > 0 ? ms / replay.totalMs : 1
  const done = ms >= replay.totalMs
  if (phase.kind === 'stop') return { phase, ratio, fraction: phase.at, clock, mile: phase.stop.mile, progress, done }
  const eased = easeInOut(ratio)
  return { phase, ratio, fraction: lerp(phase.from, phase.to, eased), clock, mile: lerp(phase.fromMile, phase.toMile, eased), progress, done }
}

function phaseIndexOf(replay: Replay, kind: 'pickup' | 'dropoff'): number {
  return replay.phases.findIndex((phase) => phase.kind === 'stop' && phase.stop.kind === kind)
}

export function cargoLoad(replay: Replay, frame: ReplayFrame): number {
  const current = replay.phases.indexOf(frame.phase)
  const pickup = phaseIndexOf(replay, 'pickup')
  const dropoff = phaseIndexOf(replay, 'dropoff')
  if (frame.done || current < pickup) return 0
  if (current === pickup) return frame.ratio
  if (current === dropoff) return 1 - frame.ratio
  return current < dropoff ? 1 : 0
}
