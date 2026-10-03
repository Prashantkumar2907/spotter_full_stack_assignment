import { CalendarClock, Clock, FileText, Fuel, Route, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { DUTY_STATUS_COLORS, DUTY_STATUS_LABELS } from '../../constants/duty'
import type { TripPlan, TripSummary } from '../../types/trip'
import { partsFromTotals, sumDutyHours } from '../../utils/duty'
import { formatMiles, pluralize } from '../../utils/format'
import { formatDuration, formatElapsed } from '../../utils/time'
import { cx } from '../../utils/cx'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { Panel } from '../ui/Panel'
import { DutyBar } from './DutyBar'
import styles from './TripStats.module.css'

interface StatProps {
  icon: LucideIcon
  label: string
  children: ReactNode
  detail?: string
}

function Stat({ icon: Icon, label, children, detail }: StatProps) {
  return (
    <div className={styles.stat}>
      <p className={styles.label}>
        <Icon size={14} aria-hidden="true" />
        {label}
      </p>
      <p className={styles.value}>{children}</p>
      {detail && <p className={styles.detail}>{detail}</p>}
    </div>
  )
}

function stopsDetail(summary: TripSummary): string {
  const rests = summary.rests + summary.restarts
  return `${summary.fuel_stops} fuel · ${pluralize(rests, 'rest')} · ${pluralize(summary.breaks, 'break')}`
}

function DutyMix({ plan }: { plan: TripPlan }) {
  const totals = sumDutyHours(plan.logs)
  const parts = partsFromTotals(totals)
  return (
    <div className={styles.mix}>
      <DutyBar parts={parts} label="Hours by duty status" />
      <ul className={styles.legend}>
        {parts.map(({ status, weight }) => (
          <li key={status}>
            <span className={styles.swatch} style={{ background: DUTY_STATUS_COLORS[status] }} />
            {DUTY_STATUS_LABELS[status]} <strong>{weight.toFixed(1)} h</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TripStats({ plan, className }: { plan: TripPlan; className?: string }) {
  const { summary } = plan
  const stops = summary.fuel_stops + summary.breaks + summary.rests + summary.restarts
  return (
    <Panel className={cx(styles.panel, className)} aria-label="Trip summary">
      <div className={styles.stats}>
        <Stat icon={Route} label="Distance">
          <AnimatedNumber value={summary.total_miles} format={formatMiles} />
        </Stat>
        <Stat icon={Clock} label="Driving">
          <AnimatedNumber value={summary.driving_minutes} format={(value) => formatDuration(Math.round(value))} />
        </Stat>
        <Stat icon={CalendarClock} label="Trip time">
          {formatElapsed(summary.total_minutes)}
        </Stat>
        <Stat icon={FileText} label="Daily logs">
          <AnimatedNumber value={summary.days} format={(value) => String(Math.round(value))} />
        </Stat>
        <Stat icon={Fuel} label="Stops" detail={stopsDetail(summary)}>
          <AnimatedNumber value={stops} format={(value) => String(Math.round(value))} />
        </Stat>
      </div>
      <DutyMix plan={plan} />
    </Panel>
  )
}
