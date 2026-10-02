import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { Stop } from '../../types/trip'
import type { LatLng } from '../../utils/polyline'

const FIT_PADDING: [number, number] = [56, 56]
const FIT_DURATION_S = 1.1
const FOCUS_DURATION_S = 0.9
const FOCUS_MIN_ZOOM = 8

export function FitRoute({ points }: { points: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    map.invalidateSize()
    map.flyToBounds(points, { padding: FIT_PADDING, duration: FIT_DURATION_S })
  }, [map, points])
  return null
}

export function FocusStop({ stop }: { stop: Stop | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (!stop) return
    map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), FOCUS_MIN_ZOOM), {
      duration: FOCUS_DURATION_S,
    })
  }, [map, stop])
  return null
}

export function KeepSized() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}
