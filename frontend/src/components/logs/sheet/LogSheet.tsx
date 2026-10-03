import { useMemo } from 'react'
import type { Ref } from 'react'
import type { DailyLog } from '../../../types/trip'
import { DutyGrid } from './DutyGrid'
import { RecapBlock } from './RecapBlock'
import { RemarksBlock } from './RemarksBlock'
import { SheetHeader } from './SheetHeader'
import { SHEET_HEIGHT, SHEET_WIDTH, buildRemarkMarks } from './sheetLayout'
import { PAPER } from './sheetTheme'

interface LogSheetProps {
  log: DailyLog
  svgRef?: Ref<SVGSVGElement>
  className?: string
}

export function LogSheet({ log, svgRef, className }: LogSheetProps) {
  const marks = useMemo(() => buildRemarkMarks(log.segments, log.remarks), [log.segments, log.remarks])
  return (
    <svg
      ref={svgRef}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Driver's daily log for ${log.date}`}
    >
      <rect width={SHEET_WIDTH} height={SHEET_HEIGHT} fill={PAPER} />
      <SheetHeader log={log} />
      <DutyGrid log={log} marks={marks} />
      <RemarksBlock log={log} marks={marks} />
      <RecapBlock log={log} />
    </svg>
  )
}
