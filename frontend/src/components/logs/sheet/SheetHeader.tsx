import type { DailyLog } from '../../../types/trip'
import { formatMilesDecimal } from '../../../utils/format'
import { splitDate } from '../../../utils/time'
import { Box, Caption, Label, PenText, Underline } from './SheetPrimitives'
import { PAD, SHEET_WIDTH } from './sheetLayout'
import { FONT_DISPLAY, MUTED } from './sheetTheme'

const DATE_FIELDS = [
  { key: 'month', x: 340, width: 64, caption: '(month)' },
  { key: 'day', x: 424, width: 64, caption: '(day)' },
  { key: 'year', x: 508, width: 88, caption: '(year)' },
] as const

const RIGHT_LINES_X = 500
const RIGHT_LINES_END = SHEET_WIDTH - PAD
const LEFT_BOX_X = PAD + 36
const BOX_HEIGHT = 30
const BOX_WIDTH = 150

function DateFields({ date }: { date: string }) {
  const parts = splitDate(date)
  return (
    <g>
      {DATE_FIELDS.map(({ key, x, width, caption }) => (
        <g key={key}>
          <PenText x={x + width / 2} y={34} anchor="middle">
            {parts[key]}
          </PenText>
          <Underline x1={x} x2={x + width} y={40} />
          <Caption x={x + width / 2} y={53} anchor="middle">
            {caption}
          </Caption>
        </g>
      ))}
      <Label x={414} y={38} anchor="middle" size={16}>
        /
      </Label>
      <Label x={498} y={38} anchor="middle" size={16}>
        /
      </Label>
    </g>
  )
}

function TitleBlock() {
  return (
    <g>
      <text x={PAD} y={38} fontSize={30} fontWeight={800} fontFamily={FONT_DISPLAY} fill="#15181d">
        Drivers Daily Log
      </text>
      <Caption x={PAD + 2} y={54}>
        (24 hours)
      </Caption>
      <Caption x={632} y={32}>
        Original - File at home terminal.
      </Caption>
      <Caption x={632} y={47}>
        Duplicate - Driver retains in his/her possession for 8 days.
      </Caption>
    </g>
  )
}

function RouteLines({ log }: { log: DailyLog }) {
  return (
    <g>
      <Label x={PAD + 36} y={84} weight={700} size={13}>
        From:
      </Label>
      <PenText x={PAD + 84} y={83}>
        {log.from_location}
      </PenText>
      <Underline x1={PAD + 80} x2={470} y={88} width={1.4} />
      <Label x={500} y={84} weight={700} size={13}>
        To:
      </Label>
      <PenText x={534} y={83}>
        {log.to_location}
      </PenText>
      <Underline x1={528} x2={RIGHT_LINES_END} y={88} width={1.4} />
    </g>
  )
}

interface BoxFieldProps {
  x: number
  y: number
  width: number
  value: string
  captions: string[]
  size?: number
}

function BoxField({ x, y, width, value, captions, size = 16 }: BoxFieldProps) {
  return (
    <g>
      <Box x={x} y={y} width={width} height={BOX_HEIGHT} />
      <PenText x={x + width / 2} y={y + 20} anchor="middle" size={size}>
        {value}
      </PenText>
      {captions.map((line, index) => (
        <Caption key={line} x={x + width / 2} y={y + BOX_HEIGHT + 13 + index * 11} anchor="middle">
          {line}
        </Caption>
      ))}
    </g>
  )
}

function MileageBoxes({ log }: { log: DailyLog }) {
  const miles = formatMilesDecimal(log.total_miles)
  return (
    <g>
      <BoxField x={LEFT_BOX_X} y={100} width={BOX_WIDTH} value={miles} captions={['Total Miles Driving Today']} />
      <BoxField
        x={LEFT_BOX_X + BOX_WIDTH + 10}
        y={100}
        width={BOX_WIDTH}
        value={miles}
        captions={['Total Mileage Today']}
      />
      <BoxField
        x={LEFT_BOX_X}
        y={152}
        width={BOX_WIDTH * 2 + 10}
        value={log.details.vehicle_numbers}
        size={13}
        captions={[
          'Truck/Tractor and Trailer Numbers or',
          'License Plate(s)/State (show each unit)',
        ]}
      />
    </g>
  )
}

function CarrierLines({ log }: { log: DailyLog }) {
  const lines = [
    { y: 118, value: log.details.carrier_name, caption: 'Name of Carrier or Carriers' },
    { y: 154, value: log.details.main_office_address, caption: 'Main Office Address' },
    { y: 190, value: log.details.home_terminal_address, caption: 'Home Terminal Address' },
  ]
  const center = (RIGHT_LINES_X + RIGHT_LINES_END) / 2
  return (
    <g>
      {lines.map(({ y, value, caption }) => (
        <g key={caption}>
          <PenText x={RIGHT_LINES_X + 6} y={y - 5} size={13}>
            {value}
          </PenText>
          <Underline x1={RIGHT_LINES_X} x2={RIGHT_LINES_END} y={y} />
          <Label x={center} y={y + 13} anchor="middle" size={10.5} weight={600} fill={MUTED}>
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
      <RouteLines log={log} />
      <MileageBoxes log={log} />
      <CarrierLines log={log} />
    </g>
  )
}
