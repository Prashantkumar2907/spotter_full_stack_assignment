import type { DailyLog } from '../../../types/trip'
import { formatHours } from '../../../utils/time'
import { GridRows } from './GridRows'
import { HourBand } from './HourBand'
import { PenText } from './SheetPrimitives'
import {
  MARKER_LANES,
  MARKER_RADIUS,
  ROWS_BOTTOM,
  STATUS_ROWS,
  TOTALS_RIGHT,
  buildDutyPath,
  minuteToX,
  rowCenterY,
} from './sheetLayout'
import { INK, PEN } from './sheetTheme'

const TOTAL_RULE_WIDTH = 54
const MARKER_LANE_GAP = 2 * MARKER_RADIUS
const MARKER_FIRST_OFFSET = 14

function Rule({ y }: { y: number }) {
  return (
    <line
      x1={TOTALS_RIGHT - TOTAL_RULE_WIDTH}
      x2={TOTALS_RIGHT}
      y1={y}
      y2={y}
      stroke={INK}
      strokeWidth={1}
    />
  )
}

function TotalsColumn({ log }: { log: DailyLog }) {
  const grandTotal = STATUS_ROWS.reduce((sum, status) => sum + log.totals[status], 0)
  return (
    <g>
      {STATUS_ROWS.map((status) => {
        const y = rowCenterY(status)
        return (
          <g key={status}>
            <PenText x={TOTALS_RIGHT - 6} y={y + 4} anchor="end" size={13}>
              {formatHours(log.totals[status])}
            </PenText>
            <Rule y={y + 10} />
          </g>
        )
      })}
      <PenText x={TOTALS_RIGHT - 6} y={ROWS_BOTTOM + 18} anchor="end" size={13}>
        {`= ${formatHours(grandTotal)}`}
      </PenText>
      <Rule y={ROWS_BOTTOM + 23} />
      <Rule y={ROWS_BOTTOM + 26} />
    </g>
  )
}

function DutyLine({ log }: { log: DailyLog }) {
  return (
    <path
      className="sheet-pen"
      d={buildDutyPath(log.segments)}
      pathLength={1}
      fill="none"
      stroke={PEN}
      strokeWidth={3}
      strokeLinejoin="miter"
      strokeLinecap="butt"
    />
  )
}

function ChangeMarker({ number, minute, lane }: { number: number; minute: number; lane: number }) {
  const x = minuteToX(minute)
  const y = ROWS_BOTTOM + MARKER_FIRST_OFFSET + lane * MARKER_LANE_GAP
  return (
    <g>
      <line x1={x} x2={x} y1={ROWS_BOTTOM} y2={y - MARKER_RADIUS} stroke={PEN} strokeWidth={1} />
      <circle cx={x} cy={y} r={MARKER_RADIUS} fill="#fff" stroke={PEN} strokeWidth={1.2} />
      <PenText x={x} y={y + 3.2} anchor="middle" size={9}>
        {String(number)}
      </PenText>
    </g>
  )
}

function ChangeMarkers({ log }: { log: DailyLog }) {
  return (
    <g>
      {log.remarks.map((remark, index) => (
        <ChangeMarker
          key={`${remark.minute}-${index}`}
          number={index + 1}
          minute={remark.minute}
          lane={index % MARKER_LANES}
        />
      ))}
    </g>
  )
}

export function DutyGrid({ log }: { log: DailyLog }) {
  return (
    <g>
      <HourBand />
      <GridRows />
      <DutyLine log={log} />
      <TotalsColumn log={log} />
      <ChangeMarkers log={log} />
    </g>
  )
}
