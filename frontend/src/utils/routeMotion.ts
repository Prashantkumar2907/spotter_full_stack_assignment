import type { LatLng } from './polyline'

const DEGREES_TO_RADIANS = Math.PI / 180
const RADIANS_TO_DEGREES = 180 / Math.PI

export interface MeasuredPath {
  points: LatLng[]
  cumulative: number[]
  total: number
}

export interface PathPosition {
  point: LatLng
  heading: number
}

export function decimate(points: LatLng[], maxPoints: number): LatLng[] {
  if (points.length <= maxPoints) return points
  const step = (points.length - 1) / (maxPoints - 1)
  return Array.from({ length: maxPoints }, (_, index) => points[Math.round(index * step)])
}

function segmentLength(a: LatLng, b: LatLng): number {
  const scale = Math.cos(((a[0] + b[0]) / 2) * DEGREES_TO_RADIANS)
  return Math.hypot(b[0] - a[0], (b[1] - a[1]) * scale)
}

export function measurePath(points: LatLng[]): MeasuredPath {
  const cumulative = [0]
  for (let index = 1; index < points.length; index++) {
    cumulative.push(cumulative[index - 1] + segmentLength(points[index - 1], points[index]))
  }
  return { points, cumulative, total: cumulative[cumulative.length - 1] }
}

export function headingBetween(a: LatLng, b: LatLng): number {
  const scale = Math.cos(((a[0] + b[0]) / 2) * DEGREES_TO_RADIANS)
  return Math.atan2(-(b[0] - a[0]), (b[1] - a[1]) * scale) * RADIANS_TO_DEGREES
}

function segmentIndex(cumulative: number[], distance: number): number {
  let low = 1
  let high = cumulative.length - 1
  while (low < high) {
    const middle = (low + high) >> 1
    if (cumulative[middle] < distance) low = middle + 1
    else high = middle
  }
  return low
}

export function positionAlong(path: MeasuredPath, fraction: number): PathPosition {
  const { points, cumulative, total } = path
  if (points.length < 2 || total === 0) return { point: points[0], heading: 0 }
  const distance = Math.min(1, Math.max(0, fraction)) * total
  const index = segmentIndex(cumulative, distance)
  const start = points[index - 1]
  const end = points[index]
  const span = cumulative[index] - cumulative[index - 1]
  const ratio = span > 0 ? (distance - cumulative[index - 1]) / span : 0
  return {
    point: [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio],
    heading: headingBetween(start, end),
  }
}

export function truckTransform(heading: number): string {
  const upsideDown = Math.abs(heading) > 90
  return `rotate(${heading.toFixed(1)}deg)${upsideDown ? ' scaleY(-1)' : ''}`
}

export function easeInOut(progress: number): number {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
}
