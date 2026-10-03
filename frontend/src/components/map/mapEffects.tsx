import type { Map as LeafletMap } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { Stop } from '../../types/trip'
import type { LatLng } from '../../utils/polyline'

const FIT_PADDING: [number, number] = [56, 56]
const FIT_DURATION_S = 1.1
const FOCUS_DURATION_S = 0.9
const FOCUS_MIN_ZOOM = 8

function hasArea(map: LeafletMap): boolean {
  map.invalidateSize()
  const size = map.getSize()
  return size.x > 0 && size.y > 0
}

export function FitRoute({ points }: { points: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    const fit = () => {
      if (!hasArea(map)) return false
      map.flyToBounds(points, { padding: FIT_PADDING, duration: FIT_DURATION_S })
      return true
    }
    if (fit()) return
    const observer = new ResizeObserver(() => {
      if (fit()) observer.disconnect()
    })
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map, points])
  return null
}

export function FocusStop({ stop }: { stop: Stop | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (!stop || !hasArea(map)) return
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
