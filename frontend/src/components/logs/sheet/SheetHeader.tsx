import type { DailyLog } from '../../../types/trip'
import { formatMilesDecimal } from '../../../utils/format'
import { splitDate } from '../../../utils/time'
import { Box, Caption, Label, PenText, Underline } from './SheetPrimitives'
import { FONT_DISPLAY, INK } from './sheetTheme'

const DATE_FIELDS = [
  { key: 'month', x: 330, width: 72, caption: '(month)' },
  { key: 'day', x: 414, width: 72, caption: '(day)' },
  { key: 'year', x: 498, width: 72, caption: '(year)' },
] as const

const BOX_LEFT = 102
const BOX_WIDTH = 160
const BOX_GAP = 8
const LINES_LEFT = 446
const LINES_RIGHT = 910
const PAD_LEFT = 40

function DateFields({ date }: { date: string }) {
  const parts = splitDate(date)
  return (
    <g>
      {DATE_FIELDS.map(({ key, x, width, caption }) => (
        <g key={key}>
          <PenText x={x + width / 2} y={34} anchor="middle" size={16}>
            {parts[key]}
          </PenText>
          <Underline x1={x} x2={x + width} y={40} />
          <Caption x={x + width / 2} y={55} anchor="middle">
            {caption}
          </Caption>
        </g>
      ))}
      <Label x={408} y={40} anchor="middle" size={18}>
        /
      </Label>
      <Label x={492} y={40} anchor="middle" size={18}>
        /
      </Label>
    </g>
  )
}

function TitleBlock() {
  return (
    <g>
      <text x={PAD_LEFT} y={36} fontSize={30} fontWeight={800} fontFamily={FONT_DISPLAY} fill={INK}>
        Drivers Daily Log
      </text>
      <Caption x={142} y={54} anchor="middle">
        (24 hours)
      </Caption>
      <Label x={600} y={30} size={10.5} weight={600}>
        Original - File at home terminal.
      </Label>
      <Label x={600} y={48} size={10.5} weight={600}>
        Duplicate - Driver retains in his/her possession for 8 days.
      </Label>
    </g>
  )
}

function FromTo({ log }: { log: DailyLog }) {
  return (
    <g>
      <Label x={126} y={86} weight={700} size={14}>
        From:
      </Label>
      <PenText x={176} y={85} size={15}>
        {log.from_location}
      </PenText>
      <Underline x1={124} x2={470} y={91} width={1.2} />
      <Label x={508} y={86} weight={700} size={14}>
        To:
      </Label>
      <PenText x={540} y={85} size={15}>
        {log.to_location}
      </PenText>
      <Underline x1={504} x2={852} y={91} width={1.2} />
    </g>
  )
}

interface BoxFieldProps {
  x: number
  y: number
  width: number
  height: number
  value: string
  captions: string[]
}

function BoxField({ x, y, width, height, value, captions }: BoxFieldProps) {
  return (
    <g>
      <Box x={x} y={y} width={width} height={height} />
      <PenText x={x + width / 2} y={y + height / 2 + 6} anchor="middle" size={17}>
        {value}
      </PenText>
      {captions.map((line, index) => (
        <Label key={line} x={x + width / 2} y={y + height + 14 + index * 13} anchor="middle" size={10.5} weight={600}>
          {line}
        </Label>
      ))}
    </g>
  )
}

function MileageBoxes({ log }: { log: DailyLog }) {
  const miles = formatMilesDecimal(log.total_miles)
  const wide = BOX_WIDTH * 2 + BOX_GAP
  return (
    <g>
      <BoxField x={BOX_LEFT} y={124} width={BOX_WIDTH} height={42} value={miles} captions={['Total Miles Driving Today']} />
      <BoxField
        x={BOX_LEFT + BOX_WIDTH + BOX_GAP}
        y={124}
        width={BOX_WIDTH}
        height={42}
        value={miles}
        captions={['Total Mileage Today']}
      />
      <BoxField
        x={BOX_LEFT}
        y={194}
        width={wide}
        height={40}
        value={log.details.vehicle_numbers}
        captions={['Truck/Tractor and Trailer Numbers or', 'License Plate(s)/State (show each unit)']}
      />
    </g>
  )
}

function CarrierLines({ log }: { log: DailyLog }) {
  const lines = [
    { y: 152, value: log.details.carrier_name, caption: 'Name of Carrier or Carriers' },
    { y: 194, value: log.details.main_office_address, caption: 'Main Office Address' },
    { y: 236, value: log.details.home_terminal_address, caption: 'Home Terminal Address' },
  ]
  const center = (LINES_LEFT + LINES_RIGHT) / 2
  return (
    <g>
      {lines.map(({ y, value, caption }) => (
        <g key={caption}>
          <PenText x={center} y={y - 6} anchor="middle" size={14}>
            {value}
          </PenText>
          <Underline x1={LINES_LEFT} x2={LINES_RIGHT} y={y} />
          <Label x={center} y={y + 14} anchor="middle" size={10.5} weight={600}>
            {caption}
          </Label>
        </g>
      ))}
    </g>
  )
}

export function SheetHeader({ log }: { log: DailyLog }) {
  return (
    <g>
      <TitleBlock />
      <DateFields date={log.date} />
      <FromTo log={log} />
      <MileageBoxes log={log} />
      <CarrierLines log={log} />
    </g>
  )
}
