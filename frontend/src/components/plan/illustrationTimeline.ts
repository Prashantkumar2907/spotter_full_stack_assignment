import { Flag, LocateFixed, PackageOpen, type LucideIcon } from 'lucide-react'

export const LOOP = '12s'
export const VIEW_WIDTH = 480
export const VIEW_HEIGHT = 340
export const VIEWBOX = `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`

export const DEPART = 0.06
export const PICKUP_ARRIVAL = 0.32
export const PICKUP_DEPART = 0.46
export const DROPOFF_ARRIVAL = 0.74
export const DROPOFF_DONE = 0.88
const HOLD_END = 0.95

export const FADE_TIMES = '0;0.03;0.96;1'

const HOLD = '0 0 1 1'
const EASE = '0.45 0 0.55 1'

interface Point {
  x: number
  y: number
}

const START: Point = { x: 86, y: 40 }
const PICKUP: Point = { x: 200, y: 170 }
const DROPOFF: Point = { x: 86, y: 300 }
const BEND = 70

function curveTo(from: Point, to: Point): string {
  return `C${from.x} ${from.y + BEND} ${to.x} ${to.y - BEND} ${to.x} ${to.y}`
}

export const LEG_TO_PICKUP = `M${START.x} ${START.y}${curveTo(START, PICKUP)}`
export const LEG_LOADED = `M${PICKUP.x} ${PICKUP.y}${curveTo(PICKUP, DROPOFF)}`
export const ROUTE_PATH = `${LEG_TO_PICKUP}${curveTo(PICKUP, DROPOFF)}`

export interface Motion {
  keyTimes: string
  values: string
  keySplines: string
}

export const TRUCK_MOTION: Motion = {
  keyTimes: `0;${DEPART};${PICKUP_ARRIVAL};${PICKUP_DEPART};${DROPOFF_ARRIVAL};1`,
  values: '0;0;0.5;0.5;1;1',
  keySplines: [HOLD, EASE, HOLD, EASE, HOLD].join(';'),
}

function trailReveal(leave: number, arrive: number): Motion {
  return { keyTimes: `0;${leave};${arrive};1`, values: '1;1;0;0', keySplines: [HOLD, EASE, HOLD].join(';') }
}

export const EMPTY_TRAIL = trailReveal(DEPART, PICKUP_ARRIVAL)
export const LOADED_TRAIL = trailReveal(PICKUP_DEPART, DROPOFF_ARRIVAL)

export const CARGO_WIDTH = 25
export const CARGO_FILL = {
  keyTimes: `0;${PICKUP_ARRIVAL};${PICKUP_DEPART};${DROPOFF_ARRIVAL};${DROPOFF_DONE};1`,
  values: `0;0;${CARGO_WIDTH};${CARGO_WIDTH};0;0`,
}

export const BLOCKS = 'M0 104H480M0 236H480M24 0V340M150 0V340M272 0V340M440 0V340'

export const LOG_CARD = { x: 280, y: 104, width: 186, height: 132 }
export const GRID_X = LOG_CARD.x + 34
export const GRID_WIDTH = LOG_CARD.width - 48
export const GRID_TOP = LOG_CARD.y + 44
export const GRID_ROW = 17
export const DUTY_ROWS = ['OFF', 'SB', 'D', 'ON']
export const HOURS_PER_DAY = 24

const rowCenter = (row: number) => GRID_TOP + GRID_ROW * row + GRID_ROW / 2
const OFF_ROW = rowCenter(0)
const DRIVING_ROW = rowCenter(2)
const ON_ROW = rowCenter(3)

const DUTY_RUNS = [
  { row: OFF_ROW, share: 0.1 },
  { row: DRIVING_ROW, share: 0.28 },
  { row: ON_ROW, share: 0.12 },
  { row: DRIVING_ROW, share: 0.3 },
  { row: ON_ROW, share: 0.1 },
  { row: OFF_ROW, share: 0.1 },
]

interface TraceStep {
  axis: 'h' | 'v'
  length: number
}

function dutyTrace(): TraceStep[] {
  return DUTY_RUNS.flatMap(({ row, share }, index): TraceStep[] => {
    const run: TraceStep = { axis: 'h', length: share * GRID_WIDTH }
    if (index === 0) return [run]
    return [{ axis: 'v', length: row - DUTY_RUNS[index - 1].row }, run]
  })
}

const TRACE = dutyTrace()
const TRACE_LENGTH = TRACE.reduce((sum, step) => sum + Math.abs(step.length), 0)

function drawnAfter(stepCount: number): number {
  return TRACE.slice(0, stepCount).reduce((sum, step) => sum + Math.abs(step.length), 0) / TRACE_LENGTH
}

export const DUTY_PATH = `M${GRID_X} ${OFF_ROW}${TRACE.map(({ axis, length }) => `${axis}${+length.toFixed(2)}`).join('')}`
export const KEY_TIMES = `0;${DEPART};${PICKUP_ARRIVAL};${PICKUP_DEPART};${DROPOFF_ARRIVAL};${DROPOFF_DONE};${HOLD_END};1`

export const DUTY_PROGRESS = [0, drawnAfter(1), drawnAfter(3), drawnAfter(5), drawnAfter(7), drawnAfter(9), 1, 1]
export const DUTY_OFFSETS = DUTY_PROGRESS.map((drawn) => +(1 - drawn).toFixed(4)).join(';')
export const DUTY_PEN_POINTS = DUTY_PROGRESS.map((drawn) => +drawn.toFixed(4)).join(';')

export const STATUS_TIMES = `0;${DEPART};${PICKUP_ARRIVAL};${PICKUP_DEPART};${DROPOFF_ARRIVAL};${DROPOFF_DONE}`

export interface DutyBadge {
  label: string
  tone: string
  visible: string
}

export const DUTY_BADGES: DutyBadge[] = [
  { label: 'Off duty', tone: 'var(--status-off-duty)', visible: '1;0;0;0;0;1' },
  { label: 'Driving', tone: 'var(--status-driving)', visible: '0;1;0;1;0;0' },
  { label: 'On duty', tone: 'var(--status-on-duty)', visible: '0;0;1;0;1;0' },
]

export interface Pin extends Point {
  label: string
  note: string
  side: 'left' | 'right'
  icon: LucideIcon
  tone: string
  arrival: number
  done: number
}

export const PINS: Pin[] = [
  { ...START, label: 'Start', note: 'Head out empty', side: 'right', icon: LocateFixed, tone: 'var(--stop-start)', arrival: 0.001, done: DEPART },
  { ...PICKUP, label: 'Pickup', note: 'Load · 1 h', side: 'left', icon: PackageOpen, tone: 'var(--stop-pickup)', arrival: PICKUP_ARRIVAL, done: PICKUP_DEPART },
  { ...DROPOFF, label: 'Drop-off', note: 'Unload · 1 h', side: 'right', icon: Flag, tone: 'var(--stop-dropoff)', arrival: DROPOFF_ARRIVAL, done: DROPOFF_DONE },
]

export const PIN_CARD = { width: 112, height: 44, gap: 24, inset: 12 }
export const PROGRESS_WIDTH = PIN_CARD.width - 2 * PIN_CARD.inset

export function pinCardX(pin: Pin): number {
  return pin.side === 'right' ? PIN_CARD.gap : -PIN_CARD.gap - PIN_CARD.width
}

const round = (value: number) => +value.toFixed(3)

export function pulseTimes(arrival: number): string {
  return `0;${round(Math.max(0.0005, arrival - 0.001))};${round(arrival)};${round(arrival + 0.1)};1`
}

export function progressTimes(pin: Pin): string {
  return `0;${round(pin.arrival)};${round(pin.done)};0.96;1`
}

export function doneTimes(pin: Pin): string {
  return `0;${round(pin.done)};0.96;1`
}
