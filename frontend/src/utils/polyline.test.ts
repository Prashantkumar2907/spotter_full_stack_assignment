import { describe, expect, it } from 'vitest'
import { decodePolyline, nearestIndex, splitAtPoint } from './polyline'

describe('decodePolyline', () => {
  it('decodes the reference sample at precision 5', () => {
    const points = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@', 5)
    expect(points).toHaveLength(3)
    expect(points[0][0]).toBeCloseTo(38.5, 5)
    expect(points[0][1]).toBeCloseTo(-120.2, 5)
    expect(points[2][0]).toBeCloseTo(43.252, 5)
    expect(points[2][1]).toBeCloseTo(-126.453, 5)
  })

  it('returns an empty list for an empty string', () => {
    expect(decodePolyline('', 6)).toEqual([])
  })
})

describe('route splitting', () => {
  const points: Array<[number, number]> = [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
  ]

  it('finds the closest vertex', () => {
    expect(nearestIndex(points, [2.1, 1.9])).toBe(2)
  })

  it('splits a path into two legs that share the pickup vertex', () => {
    const [first, second] = splitAtPoint(points, [1, 1])
    expect(first).toEqual([points[0], points[1]])
    expect(second).toEqual([points[1], points[2], points[3]])
  })
})
