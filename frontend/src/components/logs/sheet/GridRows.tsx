import type { DutyStatus } from '../../../types/trip'
import { Label } from './SheetPrimitives'
import {
  GRID_WIDTH,
  GRID_X,
  ROW_HEIGHT,
  STATUS_ROWS,
  rowTop,
  tickPath,
} from './sheetLayout'
import { GRID_LIGHT, INK } from './sheetTheme'

const ROW_NUMBERS: Record<DutyStatus, string> = {
  off_duty: '1.',
  sleeper: '2.',
  driving: '3.',
  on_duty: '4.',
}

const ROW_CAPTIONS: Record<DutyStatus, string[]> = {
  off_duty: ['Off Duty'],
  sleeper: ['Sleeper', 'Berth'],
  driving: ['Driving'],
  on_duty: ['On Duty', '(not driving)'],
}

const FIRST_STANDING_ROW = 2
const CAPTION_INDENT = 14
const CAPTION_X = 40

function RowCaption({ status, top }: { status: DutyStatus; top: number }) {
  const [first, second] = ROW_CAPTIONS[status]
  const baseline = top + ROW_HEIGHT / 2 + (second ? -2 : 4)
  return (
    <g>
      <Label x={CAPTION_X} y={baseline} size={12} weight={700}>
        {`${ROW_NUMBERS[status]} ${first}`}
      </Label>
      {second && (
        <Label x={CAPTION_X + CAPTION_INDENT} y={baseline + 12} size={11} weight={700}>
          {second}
        </Label>
      )}
    </g>
  )
}

function Ticks({ index, top }: { index: number; top: number }) {
  const standing = index >= FIRST_STANDING_ROW
  const transform = standing
    ? `translate(0 ${top + ROW_HEIGHT}) scale(1 -1)`
    : `translate(0 ${top})`
  return (
    <path
      d={tickPath()}
      transform={transform}
      stroke={standing ? INK : GRID_LIGHT}
      strokeWidth={0.8}
      fill="none"
    />
  )
}

export function GridRows() {
  return (
    <g>
      {STATUS_ROWS.map((status, index) => {
        const top = rowTop(index)
        return (
          <g key={status}>
            <rect
              x={GRID_X}
              y={top}
              width={GRID_WIDTH}
              height={ROW_HEIGHT}
              fill="none"
              stroke={INK}
              strokeWidth={1.2}
            />
            <Ticks index={index} top={top} />
            <RowCaption status={status} top={top} />
          </g>
        )
      })}
    </g>
  )
}
