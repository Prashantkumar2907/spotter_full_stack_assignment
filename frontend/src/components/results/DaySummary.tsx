import { ChevronDown } from 'lucide-react'
import { DUTY_STATUS_COLORS, DUTY_STATUS_LABELS, MAX_CYCLE_HOURS } from '../../constants/duty'
import { NEAR_CYCLE_LIMIT_RATIO } from '../../constants/limits'
import type { DailyLog, DutyStatus } from '../../types/trip'
import { dutyChanges } from '../../utils/dayChanges'
import { formatMiles } from '../../utils/format'
import { formatHours, formatMinuteOfDay } from '../../utils/time'
import { activityLabel } from '../logs/sheet/sheetLayout'
import { Panel } from '../ui/Panel'
import styles from './DaySummary.module.css'

const LINE_ORDER: DutyStatus[] = ['off_duty', 'sleeper', 'driving', 'on_duty']
const HOURS_PER_DAY = 24

function HoursByLine({ log }: { log: DailyLog }) {
  return (
    <ul className={styles.lines}>
      {LINE_ORDER.map((status, index) => (
        <li key={status} className={styles.line}>
          <span className={styles.lineLabel}>
            <span className={styles.swatch} style={{ background: DUTY_STATUS_COLORS[status] }} />
            {index + 1}. {DUTY_STATUS_LABELS[status]}
          </span>
          <span className={styles.track}>
            <span
              className={styles.fill}
              style={{ background: DUTY_STATUS_COLORS[status], transform: `scaleX(${log.totals[status] / HOURS_PER_DAY})` }}
            />
          </span>
          <strong className={styles.hours}>{formatHours(log.totals[status])}</strong>
        </li>
      ))}
    </ul>
  )
}

function Changes({ log }: { log: DailyLog }) {
  const changes = dutyChanges(log)
  if (changes.length === 0) return <p className={styles.none}>No change of duty status on this day.</p>
  return (
    <ol className={styles.changes}>
      {changes.map((change) => (
        <li key={change.minute} className={styles.change}>
          <span className={styles.time}>{formatMinuteOfDay(change.minute)}</span>
          <span className={styles.dot} style={{ background: DUTY_STATUS_COLORS[change.status] }} />
          <span className={styles.what}>
            <strong>{DUTY_STATUS_LABELS[change.status]}</strong>
            <span>
              {change.location} · {activityLabel(change.activity)}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function ReadingKey() {
  return (
    <details className={styles.keyDetails}>
      <summary className={styles.keySummary}>
        How to read the sheet
        <ChevronDown size={16} className={styles.keyChevron} aria-hidden="true" />
      </summary>
      <ul className={styles.key}>
        <li>
          <svg viewBox="0 0 24 16" aria-hidden="true">
            <path d="M1 4H12V12H23" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="4" r="3" fill="var(--stop-dropoff)" />
            <circle cx="12" cy="12" r="3" fill="var(--stop-dropoff)" />
          </svg>
          Dot: a change of duty status
        </li>
        <li>
          <svg viewBox="0 0 24 16" aria-hidden="true">
            <path d="M4 2V10H20V2M12 10L8 15" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          Bracket: time the truck stood still
        </li>
        <li>
          <svg viewBox="0 0 24 16" aria-hidden="true">
            <path d="M20 2L6 15M16 2L3 13" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          Slanted note: place and activity
        </li>
      </ul>
    </details>
  )
}

function CycleRecap({ log }: { log: DailyLog }) {
  const used = log.recap.cycle_total
  const ratio = Math.min(1, used / MAX_CYCLE_HOURS)
  const color = ratio >= NEAR_CYCLE_LIMIT_RATIO ? 'var(--color-amber)' : 'var(--color-accent)'
  return (
    <section className={styles.section} aria-label="70-hour cycle">
      <div className={styles.cycleHead}>
        <h3 className={styles.heading}>70-hour cycle</h3>
        <p className={styles.recap}>
          <strong>{formatHours(log.recap.available_tomorrow)} h</strong> left tomorrow
        </p>
      </div>
      <span className={styles.track}>
        <span className={styles.fill} style={{ background: color, transform: `scaleX(${ratio})` }} />
      </span>
      <p className={styles.recap}>{formatHours(used)} h used of {MAX_CYCLE_HOURS}</p>
    </section>
  )
}

function HoursSection({ log }: { log: DailyLog }) {
  const onDuty = log.totals.driving + log.totals.on_duty
  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Hours</h3>
      <HoursByLine log={log} />
      <p className={styles.total}>
        <span>
          Total <strong>{formatHours(onDuty + log.totals.off_duty + log.totals.sleeper)} h</strong>
        </span>
        <span>
          On duty <strong className={styles.circled}>{formatHours(onDuty)}</strong>
        </span>
        <span>{formatMiles(log.total_miles)}</span>
      </p>
    </section>
  )
}

export function DaySummary({ log }: { log: DailyLog }) {
  return (
    <Panel as="aside" className={styles.panel} aria-label="Day summary">
      <HoursSection log={log} />
      <section className={`${styles.section} ${styles.grow}`}>
        <h3 className={styles.heading}>Duty changes</h3>
        <Changes log={log} />
      </section>
      <CycleRecap log={log} />
      <ReadingKey />
    </Panel>
  )
}
