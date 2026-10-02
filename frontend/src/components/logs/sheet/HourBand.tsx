import { Label } from './SheetPrimitives'
import {
  BAND_HEIGHT,
  BAND_Y,
  GRID_WIDTH,
  GRID_X,
  HOUR_WIDTH,
  HOURS_PER_DAY,
  TOTALS_RIGHT,
  hourLabel,
} from './sheetLayout'
import { GRID_FILL, MUTED } from './sheetTheme'

const EDGE_INSET = 3
const BAND_TEXT = '#ffffff'

function EdgeLabel({ hour }: { hour: number }) {
  const atStart = hour === 0
  const x = GRID_X + hour * HOUR_WIDTH + (atStart ? EDGE_INSET : -EDGE_INSET)
  const anchor = atStart ? 'start' : 'end'
  return (
    <g>
      <Label x={x} y={BAND_Y + 12} size={9} fill={BAND_TEXT} anchor={anchor}>
        Mid-
      </Label>
      <Label x={x} y={BAND_Y + 24} size={9} fill={BAND_TEXT} anchor={anchor}>
        night
      </Label>
    </g>
  )
}

function HourMark({ hour }: { hour: number }) {
  return (
    <Label
      x={GRID_X + hour * HOUR_WIDTH}
      y={BAND_Y + 20}
      size={11}
      weight={700}
      fill={BAND_TEXT}
      anchor="middle"
    >
      {hourLabel(hour)}
    </Label>
  )
}

export function HourBand() {
  const hours = Array.from({ length: HOURS_PER_DAY + 1 }, (_, hour) => hour)
  return (
    <g>
      <rect x={GRID_X} y={BAND_Y} width={GRID_WIDTH} height={BAND_HEIGHT} fill={GRID_FILL} />
      {hours.map((hour) =>
        hour === 0 || hour === HOURS_PER_DAY ? (
          <EdgeLabel key={hour} hour={hour} />
        ) : (
          <HourMark key={hour} hour={hour} />
        ),
      )}
      <Label x={TOTALS_RIGHT - 28} y={BAND_Y + 12} size={9.5} fill={MUTED} anchor="middle">
        Total
      </Label>
      <Label x={TOTALS_RIGHT - 28} y={BAND_Y + 24} size={9.5} fill={MUTED} anchor="middle">
        Hours
      </Label>
    </g>
  )
}
