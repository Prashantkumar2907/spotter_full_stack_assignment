import { CalendarClock, Clock, FileText, Fuel, Route, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TripSummary } from '../../types/trip'
import { formatMiles, pluralize } from '../../utils/format'
import { formatDateTime, formatDuration, formatElapsed } from '../../utils/time'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { Panel } from '../ui/Panel'
import styles from './SummaryStrip.module.css'

interface StatProps {
  icon: LucideIcon
  label: string
  children: ReactNode
  detail?: string
}

function Stat({ icon: Icon, label, children, detail }: StatProps) {
  return (
    <div className={styles.stat}>
      <span className={styles.iconWrap}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className={styles.text}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{children}</p>
        {detail && <p className={styles.detail}>{detail}</p>}
      </div>
    </div>
  )
}

function stopsTotal(summary: TripSummary): number {
  return summary.fuel_stops + summary.breaks + summary.rests + summary.restarts
}

function stopsDetail(summary: TripSummary): string {
  if (stopsTotal(summary) === 0) return 'No fuel, break or rest needed'
  const restTotal = summary.rests + summary.restarts
  return [
    pluralize(summary.fuel_stops, 'fuel stop'),
    pluralize(restTotal, 'rest'),
    pluralize(summary.breaks, 'break'),
  ].join(', ')
}

export function SummaryStrip({ summary }: { summary: TripSummary }) {
  return (
    <Panel className={styles.strip} aria-label="Trip summary">
      <Stat icon={Route} label="Distance">
        <AnimatedNumber value={summary.total_miles} format={formatMiles} />
      </Stat>
      <Stat icon={Clock} label="Driving time">
        <AnimatedNumber
          value={summary.driving_minutes}
          format={(value) => formatDuration(Math.round(value))}
        />
      </Stat>
      <Stat icon={CalendarClock} label="Trip length" detail={`Arrive ${formatDateTime(summary.end)}`}>
        {formatElapsed(summary.total_minutes)}
      </Stat>
      <Stat icon={FileText} label="Log sheets">
        <AnimatedNumber value={summary.days} format={(value) => String(Math.round(value))} />
      </Stat>
      <Stat icon={Fuel} label="Stops on the way" detail={stopsDetail(summary)}>
        <AnimatedNumber value={stopsTotal(summary)} format={(value) => String(Math.round(value))} />
      </Stat>
    </Panel>
  )
}
