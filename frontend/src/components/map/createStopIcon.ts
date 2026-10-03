import L from 'leaflet'
import {
  Coffee,
  Flag,
  Fuel,
  LocateFixed,
  MoonStar,
  PackageOpen,
  RotateCcw,
  createElement,
  type IconNode,
} from 'lucide'
import type { StopKind } from '../../types/trip'
import { stopTone } from './stopVisuals'

const PIN_SIZE = 36
const GLYPH_SIZE = 18
const STAGGER_MS = 45

const PIN_GLYPHS: Record<StopKind, IconNode> = {
  start: LocateFixed,
  pickup: PackageOpen,
  dropoff: Flag,
  fuel: Fuel,
  break: Coffee,
  rest: MoonStar,
  restart: RotateCcw,
}

interface PinOptions {
  selected: boolean
  index: number
}

function glyphMarkup(kind: StopKind): string {
  const svg = createElement(PIN_GLYPHS[kind], {
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    'stroke-width': 2.4,
  })
  return svg.outerHTML
}

export function createStopIcon(kind: StopKind, { selected, index }: PinOptions): L.DivIcon {
  const selectedClass = selected ? ' stop-pin--selected' : ''
  const halo = selected ? '<span class="stop-pin__halo"></span>' : ''
  return L.divIcon({
    className: 'stop-pin-host',
    iconSize: [PIN_SIZE, PIN_SIZE],
    iconAnchor: [PIN_SIZE / 2, PIN_SIZE / 2],
    popupAnchor: [0, -PIN_SIZE / 2],
    html: `<div class="stop-pin${selectedClass}" style="--tone:${stopTone(kind)};animation-delay:${index * STAGGER_MS}ms">${halo}${glyphMarkup(kind)}</div>`,
  })
}
