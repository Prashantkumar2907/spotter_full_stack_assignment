import L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { TripReplay } from '../../hooks/useTripReplay'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import type { LatLng } from '../../utils/polyline'
import { activityOf, bubbleText } from '../../utils/replayLabels'
import { approachAngle, headingBetween, measurePath, pathBetween, positionAlong, type MeasuredPath } from '../../utils/routeMotion'
import { cargoLoad, frameAt, type Replay, type ReplayFrame } from '../../utils/tripReplay'
import { TRUCK_TOP_SHAPES, TRUCK_TOP_VIEWBOX, truckMarkup } from '../layout/truckArt'

const CARGO_WIDTH = Number(TRUCK_TOP_SHAPES.find((shape) => shape.part === 'cargo')?.attrs.width ?? 0)

const ICON_WIDTH = 44
const ICON_HEIGHT = 20
const HEADING_WINDOW = 0.004
const TURN_RATE = 0.18
const AUTOPLAY_DELAY_MS = 500

interface Parts {
  marker: L.Marker
  drivenEmpty: L.Polyline
  drivenLoaded: L.Polyline
  measured: MeasuredPath
  replay: Replay
  heading: number
}

function travelIcon(): L.DivIcon {
  return L.divIcon({
    className: 'travel-pin-host',
    iconSize: [ICON_WIDTH, ICON_HEIGHT],
    iconAnchor: [ICON_WIDTH / 2, ICON_HEIGHT / 2],
    html: `<div class="travel-pin"><span class="travel-pin__halo"></span><div class="travel-pin__truck">${truckMarkup('travel-pin__art', TRUCK_TOP_SHAPES, TRUCK_TOP_VIEWBOX)}</div><div class="travel-pin__bubble" hidden><span class="travel-pin__label"></span><span class="travel-pin__bar"></span></div></div>`,
  })
}

function roadHeading(path: MeasuredPath, fraction: number): number {
  const behind = positionAlong(path, Math.max(0, fraction - HEADING_WINDOW)).point
  const ahead = positionAlong(path, Math.min(1, fraction + HEADING_WINDOW)).point
  return headingBetween(behind, ahead)
}

function markStops(map: L.Map, replay: Replay, frame: ReplayFrame) {
  const current = replay.phases.indexOf(frame.phase)
  replay.phases.forEach((phase, index) => {
    if (phase.kind !== 'stop') return
    const pin = map.getContainer().querySelector<HTMLElement>(`.stop-pin[data-stop-id="${phase.stop.id}"]`)
    const state = index < current || frame.done ? 'done' : index === current ? 'active' : 'upcoming'
    if (pin && pin.dataset.state !== state) pin.dataset.state = state
  })
}

function paintBubble(element: HTMLElement | undefined, frame: ReplayFrame) {
  const bubble = element?.querySelector<HTMLElement>('.travel-pin__bubble')
  const label = bubble?.querySelector<HTMLElement>('.travel-pin__label')
  if (!bubble || !label) return
  const text = frame.done ? '' : bubbleText(frame.phase)
  if (label.textContent !== text) label.textContent = text
  bubble.hidden = text === ''
  bubble.style.setProperty('--progress', frame.ratio.toFixed(3))
}

function paintTruck(parts: Parts, frame: ReplayFrame, smooth: boolean) {
  const element = parts.marker.getElement()
  if (frame.phase.kind === 'drive') {
    const target = roadHeading(parts.measured, frame.fraction)
    parts.heading = smooth ? approachAngle(parts.heading, target, TURN_RATE) : target
  }
  const truck = element?.querySelector<HTMLElement>('.travel-pin__truck')
  const pin = element?.querySelector<HTMLElement>('.travel-pin')
  const cargo = element?.querySelector<SVGRectElement>('.truck-cargo')
  if (truck) truck.style.transform = `rotate(${parts.heading.toFixed(1)}deg)`
  if (pin) pin.dataset.activity = activityOf(frame.phase).kind
  if (cargo) cargo.setAttribute('width', (CARGO_WIDTH * cargoLoad(parts.replay, frame)).toFixed(2))
  paintBubble(element, frame)
}

function applyFrame(map: L.Map, parts: Parts, frame: ReplayFrame, smooth: boolean) {
  parts.marker.setLatLng(positionAlong(parts.measured, frame.fraction).point)
  const { pickupAt } = parts.replay
  parts.drivenEmpty.setLatLngs(pathBetween(parts.measured, 0, Math.min(frame.fraction, pickupAt)))
  parts.drivenLoaded.setLatLngs(pathBetween(parts.measured, pickupAt, frame.fraction))
  paintTruck(parts, frame, smooth)
  markStops(map, parts.replay, frame)
}

function createParts(map: L.Map, path: LatLng[], replay: Replay): Parts {
  const measured = measurePath(path)
  const drivenEmpty = L.polyline([], { className: 'route-line route-line--driven-empty', interactive: false }).addTo(map)
  const drivenLoaded = L.polyline([], { className: 'route-line route-line--driven', interactive: false }).addTo(map)
  const marker = L.marker(path[0], { icon: travelIcon(), interactive: false, keyboard: false, zIndexOffset: 800 }).addTo(map)
  return { marker, drivenEmpty, drivenLoaded, measured, replay, heading: roadHeading(measured, 0) }
}

export function TravelMarker({ path, trip }: { path: LatLng[]; trip: TripReplay }) {
  const map = useMap()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (path.length < 2) return
    const { replay, clock } = trip
    const parts = createParts(map, path, replay)
    const render = () => applyFrame(map, parts, frameAt(replay, clock.getState().elapsed), clock.getState().playing)
    render()
    const unsubscribe = clock.subscribe(render)
    const autoplay = reduced || clock.getState().elapsed > 0 ? 0 : window.setTimeout(clock.play, AUTOPLAY_DELAY_MS)
    return () => {
      window.clearTimeout(autoplay)
      unsubscribe()
      parts.marker.remove()
      parts.drivenEmpty.remove()
      parts.drivenLoaded.remove()
    }
  }, [map, path, trip, reduced])

  return null
}
