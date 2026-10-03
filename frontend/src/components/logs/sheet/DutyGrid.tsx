import { useId } from 'react'
import type { DailyLog } from '../../../types/trip'
import { formatHours } from '../../../utils/time'
import { GridRows } from './GridRows'
import { HourBand } from './HourBand'
import { PenText } from './SheetPrimitives'
import {
  BRACKET_DEPTH,
  GRID_WIDTH,
  GRID_X,
  ROW_HEIGHT,
  ROWS_BOTTOM,
  ROWS_Y,
  STATUS_ROWS,
  TOTALS_LEFT,
  TOTALS_RIGHT,
  buildDutyPath,
  minuteToX,
  rowCenterY,
  type RemarkMark,
} from './sheetLayout'
import { INK, PEN } from './sheetTheme'

function Rule({ y, width = 1.2 }: { y: number; width?: number }) {
  return <line x1={TOTALS_LEFT} x2={TOTALS_RIGHT} y1={y} y2={y} stroke={INK} strokeWidth={width} />
}

function TotalsColumn({ log }: { log: DailyLog }) {
  const grandTotal = STATUS_ROWS.reduce((sum, status) => sum + log.totals[status], 0)
  return (
    <g>
      {STATUS_ROWS.map((status) => {
        const y = rowCenterY(status)
        return (
          <g key={status}>
            <PenText x={TOTALS_RIGHT - 4} y={y + 6} anchor="end" size={15}>
              {formatHours(log.totals[status])}
            </PenText>
            <Rule y={y + ROW_HEIGHT / 2 - 2} />
          </g>
        )
      })}
      <PenText x={TOTALS_RIGHT - 4} y={ROWS_BOTTOM + 24} anchor="end" size={15}>
        {`=${formatHours(grandTotal)}`}
      </PenText>
      <Rule y={ROWS_BOTTOM + 30} width={1.6} />
      <Rule y={ROWS_BOTTOM + 34} width={1.6} />
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

function Bracket({ mark }: { mark: RemarkMark }) {
  const x1 = minuteToX(mark.startMinute)
  const x2 = minuteToX(mark.endMinute)
  const bottom = ROWS_BOTTOM + BRACKET_DEPTH
  const d = x2 > x1 ? `M${x1} ${ROWS_BOTTOM}V${bottom}H${x2}V${ROWS_BOTTOM}` : `M${x1} ${ROWS_BOTTOM}V${bottom}`
  return <path d={d} fill="none" stroke={PEN} strokeWidth={1.8} />
}

export function DutyGrid({ log, marks }: { log: DailyLog; marks: RemarkMark[] }) {
  return (
    <g>
      <HourBand />
      <GridRows />
      <DutyLine log={log} />
      {marks.map((mark) => (
        <Bracket key={`${mark.startMinute}-${mark.location}`} mark={mark} />
      ))}
      <TotalsColumn log={log} />
    </g>
  )
}
