import { Label } from './SheetPrimitives'
import {
  GRID_X,
  HOUR_WIDTH,
  HOURS_BOX_X,
  HOURS_PER_DAY,
  MINUTES_BOX_X,
  ROWS_BOTTOM,
  ROWS_Y,
  RULER_HEIGHT,
  TOTAL_BOX_WIDTH,
  hourLabel,
  tickPath,
} from './sheetLayout'
import { INK } from './sheetTheme'

const HOURS = Array.from({ length: HOURS_PER_DAY }, (_, hour) => hour)
const RULER_TICK = 12
const HEADER_NUDGE = 3

function HourLabels({ y }: { y: number }) {
  return (
    <g>
      {HOURS.map((hour) => (
        <Label
          key={hour}
          x={GRID_X + hour * HOUR_WIDTH}
          y={y}
          size={hour % 12 === 0 ? 9.5 : 11}
          weight={600}
          anchor="middle"
        >
          {hourLabel(hour)}
        </Label>
      ))}
    </g>
  )
}

function TotalsHeader() {
  const hoursCenter = HOURS_BOX_X + TOTAL_BOX_WIDTH / 2 - HEADER_NUDGE
  const minutesCenter = MINUTES_BOX_X + TOTAL_BOX_WIDTH / 2 + HEADER_NUDGE
  return (
    <g>
      <Label x={hoursCenter} y={ROWS_Y - 8} size={10} weight={700} anchor="middle">
        HOURS
      </Label>
      <Label x={minutesCenter} y={ROWS_Y - 32} size={9} weight={700} anchor="middle">
        MINUTES
      </Label>
      <Label x={minutesCenter} y={ROWS_Y - 20} size={9} anchor="middle">
        TO BE
      </Label>
      <Label x={minutesCenter} y={ROWS_Y - 8} size={7.5} anchor="middle">
        00,15,30,45
      </Label>
    </g>
  )
}

export function HourScale() {
  return (
    <g>
      <HourLabels y={ROWS_Y - 8} />
      <TotalsHeader />
      <path d={tickPath(RULER_TICK)} transform={`translate(0 ${ROWS_BOTTOM})`} stroke={INK} strokeWidth={0.8} fill="none" />
      <HourLabels y={ROWS_BOTTOM + RULER_HEIGHT - 4} />
    </g>
  )
}
