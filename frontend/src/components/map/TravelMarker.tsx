import L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import type { LatLng } from '../../utils/polyline'
import { easeInOut, measurePath, positionAlong } from '../../utils/routeMotion'

const TRAVEL_MS = 9000
const HOLD_MS = 1400
const FADE_MS = 300
const LOOP_MS = TRAVEL_MS + HOLD_MS
const ICON_SIZE = 26

function travelIcon(): L.DivIcon {
  return L.divIcon({
    className: 'travel-pin-host',
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ICON_SIZE / 2, ICON_SIZE / 2],
    html: '<div class="travel-pin"><span class="travel-pin__halo"></span><span class="travel-pin__arrow"></span></div>',
  })
}

function frameAt(elapsed: number) {
  const time = elapsed % LOOP_MS
  return {
    fraction: time < TRAVEL_MS ? easeInOut(time / TRAVEL_MS) : 1,
    opacity: time > LOOP_MS - FADE_MS ? 0 : 1,
  }
}

export function TravelMarker({ path }: { path: LatLng[] }) {
  const map = useMap()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (path.length < 2) return
    const measured = measurePath(path)
    const marker = L.marker(path[path.length - 1], { icon: travelIcon(), interactive: false, keyboard: false, zIndexOffset: 800 })
    marker.addTo(map)
    if (reduced) return () => void marker.remove()
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const { fraction, opacity } = frameAt(now - startedAt)
      const { point, heading } = positionAlong(measured, fraction)
      marker.setLatLng(point)
      const element = marker.getElement()?.querySelector<HTMLElement>('.travel-pin')
      if (element) {
        element.style.setProperty('--heading', `${heading.toFixed(1)}deg`)
        element.style.opacity = String(opacity)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      marker.remove()
    }
  }, [map, path, reduced])

  return null
}
