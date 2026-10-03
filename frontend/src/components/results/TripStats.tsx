import type { ReactNode } from 'react'
import { DUTY_STATUS_COLORS, DUTY_STATUS_LABELS } from '../../constants/duty'
import type { TripPlan, TripSummary } from '../../types/trip'
import { partsFromTotals, sumDutyHours } from '../../utils/duty'
import { formatMiles } from '../../utils/format'
import { formatDuration, formatElapsed } from '../../utils/time'
import { cx } from '../../utils/cx'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { DutyBar } from './DutyBar'
import styles from './TripStats.module.css'

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.stat}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  )
}

function stopCount(summary: TripSummary): number {
  return summary.fuel_stops + summary.breaks + summary.rests + summary.restarts
}

function DutyMix({ plan }: { plan: TripPlan }) {
  const parts = partsFromTotals(sumDutyHours(plan.logs))
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
  return (
    <section className={cx(styles.summary, className)} aria-label="Trip summary">
      <dl className={styles.stats}>
        <Stat label="Distance">
          <AnimatedNumber value={summary.total_miles} format={formatMiles} />
        </Stat>
        <Stat label="Driving">
          <AnimatedNumber value={summary.driving_minutes} format={(value) => formatDuration(Math.round(value))} />
        </Stat>
        <Stat label="Trip time">{formatElapsed(summary.total_minutes)}</Stat>
        <Stat label="Stops">
          <AnimatedNumber value={stopCount(summary)} format={(value) => String(Math.round(value))} />
        </Stat>
      </dl>
      <DutyMix plan={plan} />
    </section>
  )
}
