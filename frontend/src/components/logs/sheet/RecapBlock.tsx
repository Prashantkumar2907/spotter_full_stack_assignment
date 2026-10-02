import type { DailyLog } from '../../../types/trip'
import { formatHours } from '../../../utils/time'
import { Box, Caption, Label, PenText } from './SheetPrimitives'
import { PAD, SHEET_WIDTH, wrapText, type SheetLayout } from './sheetLayout'
import { INK, MUTED } from './sheetTheme'

const BOX_HEIGHT = 32
const CAPTION_CHARACTERS = 20
const CAPTION_LINE_HEIGHT = 11

interface RecapCell {
  x: number
  width: number
  caption: string
  value?: string
}

function RecapBox({ cell, top }: { cell: RecapCell; top: number }) {
  return (
    <g>
      <Box x={cell.x} y={top} width={cell.width} height={BOX_HEIGHT} />
      {cell.value && (
        <PenText x={cell.x + cell.width / 2} y={top + 21} anchor="middle" size={15}>
          {cell.value}
        </PenText>
      )}
      {wrapText(cell.caption, CAPTION_CHARACTERS).map((line, index) => (
        <Caption
          key={line}
          x={cell.x + cell.width / 2}
          y={top + BOX_HEIGHT + 14 + index * CAPTION_LINE_HEIGHT}
          anchor="middle"
        >
          {line}
        </Caption>
      ))}
    </g>
  )
}

function buildCells(log: DailyLog) {
  const { recap } = log
  const seventy: RecapCell[] = [
    {
      x: 300,
      width: 104,
      caption: 'A. Total hours on duty last 7 days including today.',
      value: formatHours(recap.cycle_total),
    },
    {
      x: 414,
      width: 104,
      caption: 'B. Total hours available tomorrow 70 hr. minus A*',
      value: formatHours(recap.available_tomorrow),
    },
    {
      x: 528,
      width: 104,
      caption: 'C. Total hours on duty last 5 days including today.',
      value: formatHours(recap.last_five_days),
    },
  ]
  const sixty: RecapCell[] = [
    { x: 664, width: 88, caption: 'A. Total hours on duty last 8 days including today.' },
    { x: 762, width: 88, caption: 'B. Total hours available tomorrow 60 hr. minus A*' },
    { x: 860, width: 88, caption: 'C. Total hours on duty last 7 days including today.' },
  ]
  return { seventy, sixty }
}

export function RecapBlock({ log, layout }: { log: DailyLog; layout: SheetLayout }) {
  const top = layout.recapTop + 16
  const { seventy, sixty } = buildCells(log)
  const onDuty: RecapCell = {
    x: 170,
    width: 104,
    caption: 'On duty hours today, Total lines 3 & 4',
    value: formatHours(log.recap.on_duty_today),
  }
  return (
    <g>
      <line x1={PAD} x2={SHEET_WIDTH - PAD} y1={layout.recapTop - 8} y2={layout.recapTop - 8} stroke={INK} strokeWidth={2} />
      <Label x={PAD + 8} y={top + 12} size={11} weight={800}>
        Recap:
      </Label>
      <Label x={PAD + 8} y={top + 25} size={10} fill={MUTED}>
        Complete at end of day
      </Label>
      <RecapBox cell={onDuty} top={top} />
      <Label x={300} y={top - 8} size={10.5} weight={800}>
        70 Hour / 8 Day Drivers
      </Label>
      {seventy.map((cell) => (
        <RecapBox key={cell.x} cell={cell} top={top} />
      ))}
      <Label x={664} y={top - 8} size={10.5} weight={800} fill={MUTED}>
        60 Hour / 7 Day Drivers
      </Label>
      {sixty.map((cell) => (
        <RecapBox key={cell.x} cell={cell} top={top} />
      ))}
      <Caption x={PAD + 8} y={top + 84}>
        *If you took 34 consecutive hours off duty you have 60/70 hours available.
        {log.recap.restart_taken ? ' A 34-hour restart finished today, so the cycle count restarted.' : ''}
      </Caption>
    </g>
  )
}
