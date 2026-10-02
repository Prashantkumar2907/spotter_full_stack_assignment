import { cx } from '../../utils/cx'
import styles from './Meter.module.css'

interface MeterProps {
  value: number
  max: number
  label: string
}

const WARNING_RATIO = 0.85

export function Meter({ value, max, label }: MeterProps) {
  const ratio = Math.min(1, Math.max(0, value / max))
  return (
    <div
      className={styles.track}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(max, Math.max(0, value))}
    >
      <div
        className={cx(styles.fill, ratio >= WARNING_RATIO && styles.warning)}
        style={{ transform: `scaleX(${ratio})` }}
      />
    </div>
  )
}
