export const TRUCK_VIEWBOX = '0 0 48 26'
export const TRUCK_WIDTH = 48
export const TRUCK_HEIGHT = 26

export const TRUCK_TOP_VIEWBOX = '0 0 48 22'
export const TRUCK_TOP_WIDTH = 48
export const TRUCK_TOP_HEIGHT = 22

export type TruckPart = 'trailer' | 'cab' | 'window' | 'wheel' | 'rib' | 'hitch' | 'mirror' | 'cargo'

export interface TruckShape {
  part: TruckPart
  tag: 'rect' | 'path' | 'circle'
  attrs: Record<string, string | number>
}

const WHEEL_Y = 21.5
const WHEEL_RADIUS = 3.3
const WHEEL_X = [7.5, 16, 39.5]

export const TRUCK_SHAPES: TruckShape[] = [
  { part: 'trailer', tag: 'rect', attrs: { x: 0, y: 2, width: 31, height: 17, rx: 2.5 } },
  { part: 'hitch', tag: 'rect', attrs: { x: 30, y: 15.5, width: 4, height: 3 } },
  { part: 'cab', tag: 'path', attrs: { d: 'M33 6h7.4c.9 0 1.8.4 2.3 1.2l4 5.6c.3.4.3.9.3 1.4V19H33z' } },
  { part: 'window', tag: 'path', attrs: { d: 'M36 8.6h4.3l3.1 4.4H36z' } },
  ...WHEEL_X.map((cx): TruckShape => ({ part: 'wheel', tag: 'circle', attrs: { cx, cy: WHEEL_Y, r: WHEEL_RADIUS } })),
]

const RIB_X = [7.5, 15, 22.5]

export const TRUCK_TOP_SHAPES: TruckShape[] = [
  { part: 'trailer', tag: 'rect', attrs: { x: 0.5, y: 1, width: 31, height: 20, rx: 2.5 } },
  { part: 'cargo', tag: 'rect', attrs: { x: 3.5, y: 4, width: 25, height: 14, rx: 1.5 } },
  ...RIB_X.map((x): TruckShape => ({ part: 'rib', tag: 'rect', attrs: { x, y: 2.5, width: 1, height: 17, rx: 0.5 } })),
  { part: 'hitch', tag: 'rect', attrs: { x: 31, y: 8.5, width: 3, height: 5, rx: 1 } },
  { part: 'mirror', tag: 'rect', attrs: { x: 35.5, y: 0, width: 2.6, height: 2, rx: 1 } },
  { part: 'mirror', tag: 'rect', attrs: { x: 35.5, y: 20, width: 2.6, height: 2, rx: 1 } },
  { part: 'cab', tag: 'path', attrs: { d: 'M33 1.5h9a5.5 5.5 0 0 1 5.5 5.5v8a5.5 5.5 0 0 1-5.5 5.5h-9z' } },
  { part: 'window', tag: 'path', attrs: { d: 'M41 4h2.2a2.3 2.3 0 0 1 2.3 2.3v9.4a2.3 2.3 0 0 1-2.3 2.3H41z' } },
]

export function truckPartClass(part: TruckPart): string {
  return `truck-${part}`
}

export function truckMarkup(className = '', shapes: TruckShape[] = TRUCK_SHAPES, viewBox = TRUCK_VIEWBOX): string {
  const markup = shapes.map(({ part, tag, attrs }) => {
    const attributes = Object.entries(attrs)
      .map(([name, value]) => `${name}="${value}"`)
      .join(' ')
    return `<${tag} ${attributes} class="${truckPartClass(part)}"/>`
  }).join('')
  return `<svg class="${className}" viewBox="${viewBox}" aria-hidden="true">${markup}</svg>`
}
