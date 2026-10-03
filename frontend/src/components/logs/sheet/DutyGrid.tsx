import { useId } from 'react'
import type { DailyLog } from '../../../types/trip'
import { GridRows } from './GridRows'
import { HourScale } from './HourScale'
import { Label, PenText } from './SheetPrimitives'
import {
  BRACKET_DEPTH,
  GRID_WIDTH,
  GRID_X,
  ROW_HEIGHT,
  ROWS_BOTTOM,
  ROWS_Y,
  STATUS_ROWS,
  HOURS_BOX_X,
  MINUTES_BOX_X,
  REMARKS_LINE,
  TOTAL_BOX_WIDTH,
  STEM_LENGTH,
  buildDutyPath,
  changePoints,
  labelPositions,
  minuteToX,
  splitHoursMinutes,
  type RemarkMark,
} from './sheetLayout'
import { INK, MARKER, PEN } from './sheetTheme'

function TotalBox({ x, y, value }: { x: number; y: number; value: string }) {
  return (
    <g>
      <rect x={x} y={y} width={TOTAL_BOX_WIDTH} height={ROW_HEIGHT} fill="none" stroke={INK} strokeWidth={1.2} />
      <PenText x={x + TOTAL_BOX_WIDTH / 2} y={y + ROW_HEIGHT / 2 + 7} anchor="middle" size={16}>
        {value}
      </PenText>
    </g>
  )
}

function TotalRow({ y, hours }: { y: number; hours: number }) {
  const [whole, minutes] = splitHoursMinutes(hours)
  return (
    <g>
      <TotalBox x={HOURS_BOX_X} y={y} value={whole} />
      <TotalBox x={MINUTES_BOX_X} y={y} value={minutes} />
    </g>
  )
}

function TotalsColumn({ log }: { log: DailyLog }) {
  const grandTotal = STATUS_ROWS.reduce((sum, status) => sum + log.totals[status], 0)
  const totalY = ROWS_BOTTOM + 6
  return (
    <g>
      {STATUS_ROWS.map((status, index) => (
        <TotalRow key={status} y={ROWS_Y + index * ROW_HEIGHT} hours={log.totals[status]} />
      ))}
      <TotalRow y={totalY} hours={grandTotal} />
      <Label x={MINUTES_BOX_X + TOTAL_BOX_WIDTH} y={totalY + ROW_HEIGHT + 14} size={10.5} weight={800} anchor="end">
        TOTAL HOURS
      </Label>
    </g>
  )
}

function DutyLine({ log }: { log: DailyLog }) {
  const clipId = `pen-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <g>
      <clipPath id={clipId}>
        <rect className="sheet-reveal" x={GRID_X - 4} y={ROWS_Y - 4} width={GRID_WIDTH + 8} height={ROW_HEIGHT * 4 + 8} />
      </clipPath>
      <path
        className="sheet-duty-line"
        clipPath={`url(#${clipId})`}
        d={buildDutyPath(log.segments)}
        fill="none"
        stroke={PEN}
        strokeWidth={3}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </g>
  )
}

function Bracket({ mark, anchorX }: { mark: RemarkMark; anchorX: number }) {
  const x1 = minuteToX(mark.startMinute)
  const x2 = minuteToX(mark.endMinute)
  const top = REMARKS_LINE
  const bottom = top + BRACKET_DEPTH
  const middle = (x1 + x2) / 2
  const bracket = x2 > x1 ? `M${x1} ${top}V${bottom}H${x2}V${top}` : `M${x1} ${top}V${bottom}`
  const stem = `M${middle} ${bottom}L${anchorX} ${bottom + STEM_LENGTH}`
  return <path d={`${bracket}${stem}`} fill="none" stroke={PEN} strokeWidth={1.8} strokeLinejoin="round" />
}

function ChangeDots({ log }: { log: DailyLog }) {
  return (
    <g>
      {changePoints(log.segments).map(([x, y], index) => (
        <circle key={`${x}-${y}-${index}`} cx={x} cy={y} r={3.4} fill={MARKER} />
      ))}
    </g>
  )
}

export function DutyGrid({ log, marks }: { log: DailyLog; marks: RemarkMark[] }) {
  const anchors = labelPositions(marks)
  return (
    <g>
      <HourScale />
      <GridRows />
      <DutyLine log={log} />
      <ChangeDots log={log} />
      {marks.map((mark, index) => (
        <Bracket key={`${mark.startMinute}-${mark.location}`} mark={mark} anchorX={anchors[index]} />
      ))}
      <TotalsColumn log={log} />
    </g>
  )
}
