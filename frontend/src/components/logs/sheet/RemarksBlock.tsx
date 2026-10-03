import type { DailyLog } from '../../../types/trip'
import { Caption, Label, PenText } from './SheetPrimitives'
import {
  BRACKET_DEPTH,
  LABEL_ANGLE,
  REMARKS_BOTTOM,
  REMARKS_TOP,
  ROWS_BOTTOM,
  labelPositions,
  truncate,
  type RemarkMark,
} from './sheetLayout'
import { INK } from './sheetTheme'

const LEFT_RULE_X = 41
const RULE_WIDTH = 3
const GAP_START = 362
const GAP_END = 624
const RULE_END = 896
const LABEL_LIMIT = 24
const SHIPPING_X = 46

function RemarkLabels({ marks }: { marks: RemarkMark[] }) {
  const positions = labelPositions(marks)
  const y = ROWS_BOTTOM + BRACKET_DEPTH + 8
  return (
    <g>
      {marks.map((mark, index) => (
        <g key={`${mark.startMinute}-${mark.location}`} transform={`translate(${positions[index]} ${y}) rotate(${LABEL_ANGLE})`}>
          <PenText x={0} y={0} size={13}>
            {truncate(mark.location, LABEL_LIMIT)}
          </PenText>
        </g>
      ))}
    </g>
  )
}

function ShippingDocuments({ log }: { log: DailyLog }) {
  return (
    <g>
      <Label x={SHIPPING_X} y={640} size={13} weight={700}>
        Shipping
      </Label>
      <Label x={SHIPPING_X} y={656} size={13} weight={700}>
        Documents:
      </Label>
      <PenText x={SHIPPING_X + 2} y={684} size={13}>
        {truncate(log.details.shipping_document, 20)}
      </PenText>
      <line x1={SHIPPING_X - 2} x2={172} y1={689} y2={689} stroke={INK} strokeWidth={1} />
      <Label x={SHIPPING_X} y={703} size={10.5} weight={600}>
        DVL or Manifest No.
      </Label>
      <Label x={SHIPPING_X} y={716} size={10.5} weight={600}>
        or
      </Label>
      <PenText x={SHIPPING_X + 2} y={737} size={13}>
        {truncate(log.details.commodity, 22)}
      </PenText>
      <line x1={SHIPPING_X - 2} x2={190} y1={742} y2={742} stroke={INK} strokeWidth={1} />
      <Label x={SHIPPING_X} y={756} size={10.5} weight={600}>
        Shipper & Commodity
      </Label>
    </g>
  )
}

function Borders() {
  const y = REMARKS_BOTTOM
  return (
    <g stroke={INK} strokeWidth={RULE_WIDTH}>
      <line x1={LEFT_RULE_X} x2={LEFT_RULE_X} y1={REMARKS_TOP} y2={y} />
      <line x1={LEFT_RULE_X - 1.5} x2={GAP_START} y1={y} y2={y} />
      <line x1={GAP_END} x2={RULE_END} y1={y} y2={y} />
    </g>
  )
}

export function RemarksBlock({ log, marks }: { log: DailyLog; marks: RemarkMark[] }) {
  return (
    <g>
      <Label x={44} y={540} size={15} weight={800}>
        Remarks
      </Label>
      <Borders />
      <RemarkLabels marks={marks} />
      <ShippingDocuments log={log} />
      <Caption x={493} y={788} anchor="middle">
        Enter name of place you reported and where released from work and when and where each change of duty occurred.
      </Caption>
      <Label x={493} y={806} anchor="middle" size={11} weight={600}>
        Use time standard of home terminal.
      </Label>
    </g>
  )
}
