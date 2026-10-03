export const LOOP = '10s'
export const KEY_TIMES = '0;0.08;0.4;0.52;0.84;1'
export const ROUTE_PATH = 'M40 206 C108 206 118 126 200 128 C282 130 300 62 380 58'
export const PICKUP_SHARE = 0.4826
export const PUCK_KEY_POINTS = `0;0;${PICKUP_SHARE};${PICKUP_SHARE};1;1`
export const TRAIL_OFFSETS = `1;1;${1 - PICKUP_SHARE};${1 - PICKUP_SHARE};0;0`
export const DUTY_PATH = 'M40 249 H96 V277 H206 V291 H244 V277 H380'
export const DUTY_OFFSETS = '1;0.8586;0.5101;0.3788;0;0'
export const FADE_TIMES = '0;0.04;0.95;1'
export const GRID_TOP = 242
export const GRID_ROW = 14
export const DUTY_ROWS = ['OFF', 'SB', 'D', 'ON']

export const PINS = [
  { x: 40, y: 206, tone: 'var(--stop-start)', label: 'Start', arrival: null },
  { x: 200, y: 128, tone: 'var(--stop-pickup)', label: 'Pickup', arrival: 0.4 },
  { x: 380, y: 58, tone: 'var(--stop-dropoff)', label: 'Drop-off', arrival: 0.84 },
]

export function pulseTimes(arrival: number): string {
  return `0;${(arrival - 0.001).toFixed(3)};${arrival};${(arrival + 0.1).toFixed(3)};1`
}
