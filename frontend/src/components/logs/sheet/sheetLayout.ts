import type { DutyStatus, LogRemark, LogSegment } from '../../../types/trip'

export const SHEET_WIDTH = 1000
export const PAD = 24
export const GRID_X = 130
export const HOUR_WIDTH = 32
export const HOURS_PER_DAY = 24
export const GRID_WIDTH = HOUR_WIDTH * HOURS_PER_DAY
export const GRID_RIGHT = GRID_X + GRID_WIDTH
export const TOTALS_RIGHT = SHEET_WIDTH - PAD
export const BAND_Y = 216
export const BAND_HEIGHT = 30
export const ROWS_Y = BAND_Y + BAND_HEIGHT
export const ROW_HEIGHT = 34
export const ROWS_BOTTOM = ROWS_Y + ROW_HEIGHT * 4
export const MARKER_RADIUS = 8
export const MARKER_LANES = 2

export const REMARK_COLUMNS = 3
export const REMARK_ROW_HEIGHT = 34
export const REMARKS_LIST_X = 250
export const REMARKS_RIGHT = SHEET_WIDTH - PAD
const MIN_REMARKS_HEIGHT = 108
const REMARKS_TOP_OFFSET = 48
const REMARKS_CHROME = 48
const RECAP_HEIGHT = 104

const MINUTES_PER_HOUR = 60

export const STATUS_ROWS: DutyStatus[] = ['off_duty', 'sleeper', 'driving', 'on_duty']

export function minuteToX(minute: number): number {
  return Number((GRID_X + (minute / MINUTES_PER_HOUR) * HOUR_WIDTH).toFixed(2))
}

export function rowIndex(status: DutyStatus): number {
  return STATUS_ROWS.indexOf(status)
}

export function rowTop(index: number): number {
  return ROWS_Y + index * ROW_HEIGHT
}

export function rowCenterY(status: DutyStatus): number {
  return rowTop(rowIndex(status)) + ROW_HEIGHT / 2
}

export function mergeAdjacent(segments: LogSegment[]): LogSegment[] {
  const merged: LogSegment[] = []
  for (const segment of segments) {
    const last = merged[merged.length - 1]
    if (last && last.status === segment.status) {
      merged[merged.length - 1] = { ...last, end_minute: segment.end_minute }
    } else {
      merged.push({ ...segment })
    }
  }
  return merged
}

export function buildDutyPath(segments: LogSegment[]): string {
  return mergeAdjacent(segments)
    .map((segment, index) => {
      const y = rowCenterY(segment.status)
      const start = index === 0 ? `M${minuteToX(segment.start_minute)} ${y}` : `V${y}`
      return `${start}H${minuteToX(segment.end_minute)}`
    })
    .join('')
}

export function tickPath(): string {
  const parts: string[] = []
  for (let quarter = 0; quarter <= HOURS_PER_DAY * 4; quarter++) {
    const x = Number((GRID_X + (quarter * HOUR_WIDTH) / 4).toFixed(2))
    parts.push(`M${x} 0V${tickLength(quarter)}`)
  }
  return parts.join('')
}

function tickLength(quarter: number): number {
  if (quarter % 4 === 0) return ROW_HEIGHT
  return quarter % 2 === 0 ? ROW_HEIGHT * 0.55 : ROW_HEIGHT * 0.32
}

export interface RemarkPlacement {
  remark: LogRemark
  number: number
  column: number
  row: number
}

export function placeRemarks(remarks: LogRemark[]): RemarkPlacement[] {
  const perColumn = Math.max(1, Math.ceil(remarks.length / REMARK_COLUMNS))
  return remarks.map((remark, index) => ({
    remark,
    number: index + 1,
    column: Math.floor(index / perColumn),
    row: index % perColumn,
  }))
}

export interface SheetLayout {
  remarksTop: number
  remarksHeight: number
  footerY: number
  recapTop: number
  height: number
}

export function computeLayout(remarkCount: number): SheetLayout {
  const perColumn = Math.max(1, Math.ceil(remarkCount / REMARK_COLUMNS))
  const remarksTop = ROWS_BOTTOM + REMARKS_TOP_OFFSET
  const remarksHeight = Math.max(MIN_REMARKS_HEIGHT, perColumn * REMARK_ROW_HEIGHT + REMARKS_CHROME)
  const footerY = remarksTop + 20 + remarksHeight + 18
  const recapTop = footerY + 30
  return { remarksTop, remarksHeight, footerY, recapTop, height: recapTop + RECAP_HEIGHT + PAD / 2 }
}

export function wrapText(text: string, maxCharacters: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxCharacters && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  return current ? [...lines, current] : lines
}

export function truncate(text: string, maxCharacters: number): string {
  return text.length > maxCharacters ? `${text.slice(0, maxCharacters - 1)}…` : text
}

export function hourLabel(hour: number): string {
  if (hour === 12) return 'Noon'
  return String(hour % 12 === 0 ? 12 : hour % 12)
}
