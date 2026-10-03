import type { LatLngExpression, Map as LeafletMap, PointExpression } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { Stop } from '../../types/trip'
import type { LatLng } from '../../utils/polyline'

export interface FitPadding {
  topLeft: PointExpression
  bottomRight: PointExpression
}

const FIT_DURATION_S = 1.1
const FIT_SETTLE_MS = 1500
const FOCUS_DURATION_S = 0.9
const FOCUS_MIN_ZOOM = 8

function hasArea(map: LeafletMap): boolean {
  map.invalidateSize()
  const size = map.getSize()
  return size.x > 0 && size.y > 0
}

function offsetCenter(map: LeafletMap, target: LatLngExpression, zoom: number, padding: FitPadding) {
  const [left, top] = padding.topLeft as [number, number]
  const [right, bottom] = padding.bottomRight as [number, number]
  const point = map.project(target, zoom).add([(right - left) / 2, (bottom - top) / 2])
  return map.unproject(point, zoom)
}

export function FitRoute({ points, padding, onDone }: { points: LatLng[]; padding: FitPadding; onDone: () => void }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    let timer = 0
    const fit = () => {
      if (!hasArea(map)) return false
      map.flyToBounds(points, { paddingTopLeft: padding.topLeft, paddingBottomRight: padding.bottomRight, duration: FIT_DURATION_S })
      timer = window.setTimeout(onDone, FIT_SETTLE_MS)
      return true
    }
    if (fit()) return () => window.clearTimeout(timer)
    const observer = new ResizeObserver(() => {
      if (fit()) observer.disconnect()
    })
    observer.observe(map.getContainer())
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [map, points, padding, onDone])
  return null
}

export function FocusStop({ stop, padding }: { stop: Stop | undefined; padding: FitPadding }) {
  const map = useMap()
  useEffect(() => {
    if (!stop || !hasArea(map)) return
    const zoom = Math.max(map.getZoom(), FOCUS_MIN_ZOOM)
    map.flyTo(offsetCenter(map, [stop.lat, stop.lng], zoom, padding), zoom, { duration: FOCUS_DURATION_S })
  }, [map, stop, padding])
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
