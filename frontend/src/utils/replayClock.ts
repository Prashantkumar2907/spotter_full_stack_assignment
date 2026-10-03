export const REPLAY_SPEEDS = [1, 2, 4] as const
export type ReplaySpeed = (typeof REPLAY_SPEEDS)[number]

export interface ReplayState {
  elapsed: number
  playing: boolean
  speed: ReplaySpeed
}

export interface ReplayClock {
  totalMs: number
  getState: () => ReplayState
  subscribe: (listener: () => void) => () => void
  play: () => void
  pause: () => void
  seek: (ms: number) => void
  cycleSpeed: () => void
}

export function createReplayClock(totalMs: number): ReplayClock {
  let state: ReplayState = { elapsed: 0, playing: false, speed: 1 }
  const listeners = new Set<() => void>()
  let frame = 0
  let last = 0

  const set = (next: Partial<ReplayState>) => {
    state = { ...state, ...next }
    listeners.forEach((listener) => listener())
  }

  const tick = (now: number) => {
    const elapsed = Math.min(totalMs, state.elapsed + (now - last) * state.speed)
    last = now
    set({ elapsed, playing: elapsed < totalMs })
    if (elapsed < totalMs) frame = requestAnimationFrame(tick)
  }

  const pause = () => {
    cancelAnimationFrame(frame)
    if (state.playing) set({ playing: false })
  }

  const play = () => {
    cancelAnimationFrame(frame)
    last = performance.now()
    set({ playing: true, elapsed: state.elapsed >= totalMs ? 0 : state.elapsed })
    frame = requestAnimationFrame(tick)
  }

  return {
    totalMs,
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    play,
    pause,
    seek: (ms) => set({ elapsed: Math.min(totalMs, Math.max(0, ms)) }),
    cycleSpeed: () => set({ speed: REPLAY_SPEEDS[(REPLAY_SPEEDS.indexOf(state.speed) + 1) % REPLAY_SPEEDS.length] }),
  }
}
