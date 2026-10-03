import type { DutyStatus, LogRemark, LogSegment } from '../../../types/trip'

export const SHEET_WIDTH = 1000
export const SHEET_HEIGHT = 1030
export const GRID_X = 124
export const HOUR_WIDTH = 32
export const HOURS_PER_DAY = 24
export const GRID_WIDTH = HOUR_WIDTH * HOURS_PER_DAY
export const GRID_RIGHT = GRID_X + GRID_WIDTH
export const TOTALS_LEFT = 910
export const TOTALS_RIGHT = 962
export const BAND_Y = 300
export const BAND_HEIGHT = 56
export const ROWS_Y = BAND_Y + BAND_HEIGHT
export const ROW_HEIGHT = 36
export const ROWS_BOTTOM = ROWS_Y + ROW_HEIGHT * 4
export const BRACKET_DEPTH = 16
export const REMARKS_TOP = 556
export const REMARKS_BOTTOM = 820
export const RECAP_TOP = 840
export const BOTTOM_RULE = 1010
export const LABEL_ANGLE = 60
export const LABEL_MIN_GAP = 15

const MINUTES_PER_HOUR = 60
const PADDING_ACTIVITIES = new Set(['before_trip', 'after_trip'])

export const STATUS_ROWS: DutyStatus[] = ['off_duty', 'sleeper', 'driving', 'on_duty']

export function minuteToX(minute: number): number {
  return Number((GRID_X + (minute / MINUTES_PER_HOUR) * HOUR_WIDTH).toFixed(2))
}

export function rowTop(index: number): number {
  return ROWS_Y + index * ROW_HEIGHT
}

export function rowCenterY(status: DutyStatus): number {
  return rowTop(STATUS_ROWS.indexOf(status)) + ROW_HEIGHT / 2
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

function tickLength(quarter: number): number {
  if (quarter % 4 === 0) return ROW_HEIGHT
  return quarter % 2 === 0 ? ROW_HEIGHT * 0.5 : ROW_HEIGHT * 0.28
}

export function tickPath(): string {
  const parts: string[] = []
  for (let quarter = 0; quarter <= HOURS_PER_DAY * 4; quarter++) {
    const x = Number((GRID_X + (quarter * HOUR_WIDTH) / 4).toFixed(2))
    parts.push(`M${x} 0V${tickLength(quarter)}`)
  }
  return parts.join('')
}

export interface RemarkMark {
  startMinute: number
  endMinute: number
  location: string
}

function isStationary(segment: LogSegment): boolean {
  return segment.status !== 'driving' && !PADDING_ACTIVITIES.has(segment.activity)
}

export function buildRemarkMarks(segments: LogSegment[], remarks: LogRemark[]): RemarkMark[] {
  const locations = new Map(remarks.map((remark) => [remark.minute, remark.location]))
  const marks: RemarkMark[] = []
  for (const segment of segments) {
    const location = locations.get(segment.start_minute)
    if (!location || segment.activity === 'before_trip') continue
    const last = marks[marks.length - 1]
    const continues = last && last.endMinute === segment.start_minute && last.location === location
    if (continues) {
      if (isStationary(segment)) last.endMinute = segment.end_minute
      continue
    }
    const end = isStationary(segment) ? segment.end_minute : segment.start_minute
    marks.push({ startMinute: segment.start_minute, endMinute: end, location })
  }
  return marks
}

export function labelPositions(marks: RemarkMark[]): number[] {
  const positions: number[] = []
  for (const mark of marks) {
    const natural = minuteToX(mark.startMinute) + 4
    const previous = positions[positions.length - 1]
    positions.push(previous === undefined ? natural : Math.max(natural, previous + LABEL_MIN_GAP))
  }
  return positions
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
