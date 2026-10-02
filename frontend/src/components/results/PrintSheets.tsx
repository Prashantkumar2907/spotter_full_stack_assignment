import type { TripPlan } from '../../types/trip'
import { LogSheet } from '../logs/sheet/LogSheet'

export function PrintSheets({ plan }: { plan: TripPlan }) {
  return (
    <div className="print-sheets" aria-hidden="true">
      {plan.logs.map((log) => (
        <LogSheet key={log.date} log={log} className="print-sheet" />
      ))}
    </div>
  )
}
