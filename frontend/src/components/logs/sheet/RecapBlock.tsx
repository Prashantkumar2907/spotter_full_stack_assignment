import type { DailyLog } from '../../../types/trip'
import { formatHours } from '../../../utils/time'
import { Label, PenText } from './SheetPrimitives'
import { BOTTOM_RULE, RECAP_TOP, wrapText } from './sheetLayout'
import { INK, MARKER } from './sheetTheme'

const LINE_Y = RECAP_TOP + 44
const CAPTION_Y = LINE_Y + 15
const LINE_HEIGHT = 12.5
const CAPTION_CHARACTERS = 12

interface RecapField {
  x: number
  width: number
  letter?: string
  caption: string
  value?: string
}

function StackedText({ x, y, lines, weight = 600 }: { x: number; y: number; lines: string[]; weight?: number }) {
  return (
    <g>
      {lines.map((line, index) => (
        <Label key={`${line}-${index}`} x={x} y={y + index * LINE_HEIGHT} size={10.5} weight={weight}>
          {line}
        </Label>
      ))}
    </g>
  )
}

function Field({ field, circled = false }: { field: RecapField; circled?: boolean }) {
  return (
    <g>
      {circled && field.value && (
        <ellipse
          cx={field.x + field.width / 2 + 6}
          cy={LINE_Y - 11}
          rx={field.width / 2 + 2}
          ry={14}
          fill="none"
          stroke={MARKER}
          strokeWidth={2}
          transform={`rotate(-4 ${field.x + field.width / 2} ${LINE_Y - 11})`}
        />
      )}
      {field.letter && (
        <Label x={field.x} y={LINE_Y - 4} size={14}>
          {field.letter}
        </Label>
      )}
      {field.value && (
        <PenText x={field.x + field.width / 2 + 6} y={LINE_Y - 5} anchor="middle" size={14}>
          {field.value}
        </PenText>
      )}
      <line x1={field.x} x2={field.x + field.width} y1={LINE_Y} y2={LINE_Y} stroke={INK} strokeWidth={1.2} />
      <StackedText x={field.x} y={CAPTION_Y} lines={wrapText(field.caption, CAPTION_CHARACTERS)} />
    </g>
  )
}

function seventyHourFields(log: DailyLog): RecapField[] {
  const { recap } = log
  return [
    { x: 294, width: 70, letter: 'A.', caption: 'A. Total hours on duty last 7 days including today.', value: formatHours(recap.cycle_total) },
    { x: 374, width: 70, letter: 'B.', caption: 'B. Total hours available tomorrow 70 hr. minus A*', value: formatHours(recap.available_tomorrow) },
    { x: 454, width: 66, letter: 'C.', caption: 'C. Total hours on duty last 5 days including today.', value: formatHours(recap.last_five_days) },
  ]
}

const SIXTY_HOUR_FIELDS: RecapField[] = [
  { x: 598, width: 72, letter: 'A.', caption: 'A. Total hours on duty last 8 days including today.' },
  { x: 681, width: 70, letter: 'B.', caption: 'B. Total hours available tomorrow 60 hr. minus A*' },
  { x: 760, width: 70, letter: 'C.', caption: 'C. Total hours on duty last 7 days including today.' },
]

export function RecapBlock({ log }: { log: DailyLog }) {
  const onDuty: RecapField = {
    x: 140,
    width: 66,
    caption: 'On duty hours today, Total lines 3 & 4',
    value: formatHours(log.recap.on_duty_today),
  }
  const footnote = log.recap.restart_taken
    ? '*If you took 34 consecutive hours off duty you have 60/70 hours available. Restart completed today.'
    : '*If you took 34 consecutive hours off duty you have 60/70 hours available'
  return (
    <g>
      <StackedText x={46} y={RECAP_TOP + 6} lines={['Recap:', 'Complete at', 'end of day']} weight={700} />
      <Field field={onDuty} circled />
      <StackedText x={221} y={RECAP_TOP + 6} lines={['70 Hour/', '8 Day', 'Drivers']} weight={700} />
      {seventyHourFields(log).map((field) => (
        <Field key={field.x} field={field} />
      ))}
      <StackedText x={530} y={RECAP_TOP + 18} lines={['60 Hour/ 7', 'Day Drivers']} weight={700} />
      {SIXTY_HOUR_FIELDS.map((field) => (
        <Field key={field.x} field={field} />
      ))}
      <StackedText x={842} y={RECAP_TOP + 6} lines={wrapText(footnote, 13)} />
      <line x1={46} x2={898} y1={BOTTOM_RULE} y2={BOTTOM_RULE} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}
