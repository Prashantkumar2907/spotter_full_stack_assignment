import { describe, expect, it } from 'vitest'
import {
  CARGO_FILL,
  DUTY_BADGES,
  DUTY_OFFSETS,
  DUTY_PEN_POINTS,
  EMPTY_TRAIL,
  KEY_TIMES,
  LOADED_TRAIL,
  PINS,
  STATUS_TIMES,
  TRUCK_MOTION,
  doneTimes,
  progressTimes,
  pulseTimes,
} from './illustrationTimeline'

const numbers = (list: string) => list.split(';').map(Number)
const ascending = (values: number[]) => expect(values).toEqual([...values].sort((a, b) => a - b))

describe('hero illustration timeline', () => {
  it('draws the log line forward and finishes it before the loop ends', () => {
    const offsets = numbers(DUTY_OFFSETS)
    expect(offsets[0]).toBe(1)
    expect(offsets.at(-1)).toBe(0)
    expect(offsets).toEqual([...offsets].sort((a, b) => b - a))
    expect(offsets).toHaveLength(numbers(KEY_TIMES).length)
    expect(numbers(DUTY_PEN_POINTS)).toHaveLength(numbers(KEY_TIMES).length)
  })

  it('keeps every key time list ordered between 0 and 1', () => {
    const lists = [KEY_TIMES, TRUCK_MOTION.keyTimes, EMPTY_TRAIL.keyTimes, LOADED_TRAIL.keyTimes, CARGO_FILL.keyTimes]
    const pinLists = PINS.flatMap((pin) => [pulseTimes(pin.arrival), progressTimes(pin), doneTimes(pin)])
    for (const times of [...lists, ...pinLists]) {
      const values = numbers(times)
      expect(values[0]).toBe(0)
      expect(values.at(-1)).toBe(1)
      ascending(values)
    }
  })

  it('gives every spline animation one easing per interval', () => {
    for (const motion of [TRUCK_MOTION, EMPTY_TRAIL, LOADED_TRAIL]) {
      expect(motion.keySplines.split(';')).toHaveLength(numbers(motion.keyTimes).length - 1)
      expect(numbers(motion.values)).toHaveLength(numbers(motion.keyTimes).length)
    }
  })

  it('stops the truck on the pickup halfway along the road and ends on the drop-off', () => {
    expect(numbers(TRUCK_MOTION.values)).toEqual([0, 0, 0.5, 0.5, 1, 1])
  })

  it('shows exactly one duty status at every moment', () => {
    const steps = numbers(STATUS_TIMES).length
    for (let step = 0; step < steps; step++) {
      expect(DUTY_BADGES.filter((badge) => numbers(badge.visible)[step] === 1)).toHaveLength(1)
    }
  })
})
