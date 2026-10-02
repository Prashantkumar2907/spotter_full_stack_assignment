import type { DailyLog } from '../../../types/trip'
import { formatMinuteOfDay } from '../../../utils/time'
import { Caption, Label, PenText } from './SheetPrimitives'
import {
  MARKER_RADIUS,
  PAD,
  REMARKS_LIST_X,
  REMARKS_RIGHT,
  REMARK_COLUMNS,
  REMARK_ROW_HEIGHT,
  placeRemarks,
  truncate,
  type SheetLayout,
} from './sheetLayout'
import { INK, MUTED, PEN } from './sheetTheme'

const COLUMN_WIDTH = (REMARKS_RIGHT - REMARKS_LIST_X) / REMARK_COLUMNS
const LOCATION_LIMIT = 24
const NOTE_LIMIT = 36
const LIST_OFFSET = 30

interface BlockProps {
  log: DailyLog
  layout: SheetLayout
}

function RemarkEntry({
  number,
  time,
  location,
  note,
  x,
  y,
}: {
  number: number
  time: string
  location: string
  note: string
  x: number
  y: number
}) {
  return (
    <g>
      <circle cx={x + MARKER_RADIUS} cy={y - 4} r={MARKER_RADIUS} fill="none" stroke={PEN} strokeWidth={1.2} />
      <PenText x={x + MARKER_RADIUS} y={y - 1} anchor="middle" size={9}>
        {String(number)}
      </PenText>
      <PenText x={x + 22} y={y} size={11}>
        {time}
      </PenText>
      <Label x={x + 92} y={y} size={11} weight={700}>
        {truncate(location, LOCATION_LIMIT)}
      </Label>
      <Caption x={x + 22} y={y + 13}>
        {truncate(note, NOTE_LIMIT)}
      </Caption>
    </g>
  )
}

function ShippingDocuments({ log, top }: { log: DailyLog; top: number }) {
  return (
    <g>
      <Label x={PAD + 14} y={top + 20} size={12} weight={700}>
        Shipping Documents:
      </Label>
      <PenText x={PAD + 14} y={top + 38} size={12}>
        {log.details.shipping_document}
      </PenText>
      <line x1={PAD + 14} x2={PAD + 196} y1={top + 42} y2={top + 42} stroke={INK} strokeWidth={1} />
      <Caption x={PAD + 14} y={top + 53}>
        DVL or Manifest No.
      </Caption>
      <Caption x={PAD + 14} y={top + 64}>
        or
      </Caption>
      <PenText x={PAD + 14} y={top + 81} size={12}>
        {truncate(log.details.commodity, 26)}
      </PenText>
      <line x1={PAD + 14} x2={PAD + 196} y1={top + 85} y2={top + 85} stroke={INK} strokeWidth={1} />
      <Caption x={PAD + 14} y={top + 96}>
        Shipper & Commodity
      </Caption>
    </g>
  )
}

function RemarksFooter({ log, y }: { log: DailyLog; y: number }) {
  const driver = log.details.driver_name
  return (
    <g>
      <Caption x={(PAD + REMARKS_RIGHT) / 2} y={y} anchor="middle">
        Enter name of place you reported and where released from work and when and where each change
        of duty occurred. Use time standard of home terminal.
      </Caption>
      {driver && (
        <Label x={REMARKS_RIGHT} y={y + 13} anchor="end" size={10} fill={MUTED}>
          {`Driver ${driver} certifies these entries are true and correct.`}
        </Label>
      )}
    </g>
  )
}

export function RemarksBlock({ log, layout }: BlockProps) {
  const boxTop = layout.remarksTop + 20
  return (
    <g>
      <Label x={PAD + 8} y={layout.remarksTop + 12} size={15} weight={800}>
        Remarks
      </Label>
      <rect
        x={PAD}
        y={boxTop}
        width={REMARKS_RIGHT - PAD}
        height={layout.remarksHeight}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />
      <line x1={PAD} x2={PAD} y1={boxTop} y2={boxTop + layout.remarksHeight} stroke={INK} strokeWidth={4} />
      <ShippingDocuments log={log} top={boxTop} />
      {placeRemarks(log.remarks).map(({ remark, number, column, row }) => (
        <RemarkEntry
          key={number}
          number={number}
          time={formatMinuteOfDay(remark.minute)}
          location={remark.location}
          note={remark.note}
          x={REMARKS_LIST_X + column * COLUMN_WIDTH}
          y={boxTop + LIST_OFFSET + row * REMARK_ROW_HEIGHT}
        />
      ))}
      <RemarksFooter log={log} y={layout.footerY} />
    </g>
  )
}
