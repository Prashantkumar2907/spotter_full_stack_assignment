import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReplayClock } from './replayClock'

describe('replay clock', () => {
  afterEach(() => vi.useRealTimers())

  it('seeks within the trip and cycles through the speeds', () => {
    const clock = createReplayClock(10_000)
    clock.seek(25_000)
    expect(clock.getState().elapsed).toBe(10_000)
    clock.seek(-5)
    expect(clock.getState().elapsed).toBe(0)
    expect(clock.getState().speed).toBe(1)
    clock.cycleSpeed()
    clock.cycleSpeed()
    expect(clock.getState().speed).toBe(4)
    clock.cycleSpeed()
    expect(clock.getState().speed).toBe(1)
  })

  it('plays to the end, stops itself and starts over when played again', () => {
    vi.useFakeTimers()
    const clock = createReplayClock(1_000)
    const listener = vi.fn()
    clock.subscribe(listener)
    clock.play()
    vi.advanceTimersByTime(2_000)
    expect(clock.getState()).toMatchObject({ elapsed: 1_000, playing: false })
    expect(listener).toHaveBeenCalled()
    clock.play()
    expect(clock.getState()).toMatchObject({ elapsed: 0, playing: true })
    clock.pause()
    expect(clock.getState().playing).toBe(false)
  })
})
