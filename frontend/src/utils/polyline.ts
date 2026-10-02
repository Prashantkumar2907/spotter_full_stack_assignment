export type LatLng = [number, number]

const ASCII_OFFSET = 63
const CHUNK_MASK = 0x1f
const CONTINUATION_BIT = 0x20
const BITS_PER_CHUNK = 5

function readValue(encoded: string, start: number): [number, number] {
  let index = start
  let shift = 0
  let result = 0
  let chunk: number
  do {
    chunk = encoded.charCodeAt(index++) - ASCII_OFFSET
    result |= (chunk & CHUNK_MASK) << shift
    shift += BITS_PER_CHUNK
  } while (chunk >= CONTINUATION_BIT)
  return [result & 1 ? ~(result >> 1) : result >> 1, index]
}

export function decodePolyline(encoded: string, precision: number): LatLng[] {
  const factor = 10 ** precision
  const points: LatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0
  while (index < encoded.length) {
    const [deltaLat, afterLat] = readValue(encoded, index)
    const [deltaLng, afterLng] = readValue(encoded, afterLat)
    index = afterLng
    lat += deltaLat
    lng += deltaLng
    points.push([lat / factor, lng / factor])
  }
  return points
}

function squaredDistance(a: LatLng, b: LatLng): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
}

export function nearestIndex(points: LatLng[], target: LatLng): number {
  let best = 0
  let bestDistance = Infinity
  points.forEach((point, index) => {
    const distance = squaredDistance(point, target)
    if (distance < bestDistance) {
      best = index
      bestDistance = distance
    }
  })
  return best
}

export function splitAtPoint(points: LatLng[], target: LatLng): [LatLng[], LatLng[]] {
  const index = nearestIndex(points, target)
  return [points.slice(0, index + 1), points.slice(index)]
}
