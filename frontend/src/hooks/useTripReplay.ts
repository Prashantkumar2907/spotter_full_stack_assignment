import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { Stop, TripPlan } from '../types/trip'
import { decodePolyline } from '../utils/polyline'
import { createReplayClock, type ReplayClock } from '../utils/replayClock'
import { ROUTE_PREVIEW_POINTS, decimate } from '../utils/routeMotion'
import { buildReplay, frameAt, stopFractions, type Replay } from '../utils/tripReplay'

export interface TripReplay {
  replay: Replay
  clock: ReplayClock
}

export function useTripReplay(plan: TripPlan): TripReplay {
  const replay = useMemo(() => {
    const path = decimate(decodePolyline(plan.route.polyline, plan.route.precision), ROUTE_PREVIEW_POINTS)
    return buildReplay(plan.stops, stopFractions(plan.stops, path))
  }, [plan])
  const clock = useMemo(() => createReplayClock(replay.totalMs), [replay])
  useEffect(() => () => clock.pause(), [clock])
  return { replay, clock }
}

export function useReplayFrame({ replay, clock }: TripReplay) {
  const state = useSyncExternalStore(clock.subscribe, clock.getState)
  return { state, frame: frameAt(replay, state.elapsed) }
}

export function useLiveStop({ replay, clock }: TripReplay): Stop | null {
  return useSyncExternalStore(clock.subscribe, () => {
    const { elapsed, playing } = clock.getState()
    if (!playing && elapsed === 0) return null
    const { phase } = frameAt(replay, elapsed)
    return phase.kind === 'stop' ? phase.stop : phase.next
  })
}
