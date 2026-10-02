import { useMemo } from 'react'
import type { Ref } from 'react'
import type { DailyLog } from '../../../types/trip'
import { DutyGrid } from './DutyGrid'
import { RecapBlock } from './RecapBlock'
import { RemarksBlock } from './RemarksBlock'
import { SheetHeader } from './SheetHeader'
import { SHEET_WIDTH, computeLayout } from './sheetLayout'
import { PAPER } from './sheetTheme'

interface LogSheetProps {
  log: DailyLog
  svgRef?: Ref<SVGSVGElement>
  className?: string
}

export function LogSheet({ log, svgRef, className }: LogSheetProps) {
  const layout = useMemo(() => computeLayout(log.remarks.length), [log.remarks.length])
  return (
    <svg
      ref={svgRef}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SHEET_WIDTH} ${layout.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Driver's daily log for ${log.date}`}
    >
      <rect width={SHEET_WIDTH} height={layout.height} fill={PAPER} />
      <SheetHeader log={log} />
      <DutyGrid log={log} />
      <RemarksBlock log={log} layout={layout} />
      <RecapBlock log={log} layout={layout} />
    </svg>
  )
}
