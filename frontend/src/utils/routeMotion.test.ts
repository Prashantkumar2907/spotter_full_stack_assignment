import { describe, expect, it } from 'vitest'
import type { LatLng } from './polyline'
import { decimate, headingBetween, measurePath, positionAlong, truckTransform } from './routeMotion'

const EQUATOR_LINE: LatLng[] = [
  [0, 0],
  [0, 1],
  [0, 2],
]

describe('route motion', () => {
  it('thins long paths but keeps both ends', () => {
    const points = Array.from({ length: 1000 }, (_, index) => [0, index] as LatLng)
    const thinned = decimate(points, 10)
    expect(thinned).toHaveLength(10)
    expect(thinned[0]).toEqual([0, 0])
    expect(thinned[9]).toEqual([0, 999])
    expect(decimate(EQUATOR_LINE, 10)).toBe(EQUATOR_LINE)
  })

  it('measures the cumulative length of a path', () => {
    const measured = measurePath(EQUATOR_LINE)
    expect(measured.cumulative).toEqual([0, 1, 2])
    expect(measured.total).toBe(2)
  })

  it('finds the point at a share of the way along', () => {
    const measured = measurePath(EQUATOR_LINE)
    expect(positionAlong(measured, 0.25).point).toEqual([0, 0.5])
    expect(positionAlong(measured, 1).point).toEqual([0, 2])
    expect(positionAlong(measured, 2).point).toEqual([0, 2])
  })

  it('points the truck the way the road goes', () => {
    expect(headingBetween([0, 0], [0, 1])).toBeCloseTo(0)
    expect(headingBetween([0, 0], [1, 0])).toBeCloseTo(-90)
    expect(Math.abs(headingBetween([0, 1], [0, 0]))).toBeCloseTo(180)
  })

  it('flips the truck instead of driving it upside down when heading west', () => {
    expect(truckTransform(10)).toBe('rotate(10.0deg)')
    expect(truckTransform(170)).toBe('rotate(170.0deg) scaleY(-1)')
  })
})
