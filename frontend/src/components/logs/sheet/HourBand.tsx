import { Label } from './SheetPrimitives'
import {
  BAND_HEIGHT,
  BAND_Y,
  GRID_X,
  HOUR_WIDTH,
  HOURS_PER_DAY,
  TOTALS_LEFT,
  TOTALS_RIGHT,
  hourLabel,
} from './sheetLayout'
import { GRID_FILL } from './sheetTheme'

const BAND_TEXT = '#ffffff'
const NUMBER_BASELINE = BAND_Y + BAND_HEIGHT - 10
const EDGE_INSET = 2

function EdgeLabel({ hour }: { hour: number }) {
  const x = GRID_X + hour * HOUR_WIDTH + (hour === 0 ? EDGE_INSET : -EDGE_INSET)
  return (
    <g>
      <Label x={x} y={NUMBER_BASELINE - 14} size={9.5} weight={700} fill={BAND_TEXT}>
        Mid-
      </Label>
      <Label x={x} y={NUMBER_BASELINE} size={9.5} weight={700} fill={BAND_TEXT}>
        night
      </Label>
    </g>
  )
}

function HourMark({ hour }: { hour: number }) {
  return (
    <Label
      x={GRID_X + hour * HOUR_WIDTH}
      y={NUMBER_BASELINE}
      size={12}
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
  const totalsCenter = (TOTALS_LEFT + TOTALS_RIGHT) / 2
  return (
    <g>
      <rect x={GRID_X} y={BAND_Y} width={TOTALS_RIGHT - GRID_X} height={BAND_HEIGHT} fill={GRID_FILL} />
      {hours.map((hour) =>
        hour === 0 || hour === HOURS_PER_DAY ? (
          <EdgeLabel key={hour} hour={hour} />
        ) : (
          <HourMark key={hour} hour={hour} />
        ),
      )}
      <Label x={totalsCenter + 6} y={NUMBER_BASELINE - 14} size={10} fill={BAND_TEXT} anchor="middle">
        Total
      </Label>
      <Label x={totalsCenter + 6} y={NUMBER_BASELINE} size={10} fill={BAND_TEXT} anchor="middle">
        Hours
      </Label>
    </g>
  )
}
