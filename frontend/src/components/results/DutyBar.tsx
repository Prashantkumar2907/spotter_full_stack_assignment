import { DUTY_STATUS_COLORS, DUTY_STATUS_LABELS } from '../../constants/duty'
import type { DutyPart } from '../../utils/duty'
import { cx } from '../../utils/cx'
import styles from './DutyBar.module.css'

interface DutyBarProps {
  parts: DutyPart[]
  label: string
  size?: 'sm' | 'md'
}

export function DutyBar({ parts, label, size = 'md' }: DutyBarProps) {
  const total = parts.reduce((sum, part) => sum + part.weight, 0) || 1
  return (
    <div className={cx(styles.bar, styles[size])} role="img" aria-label={label}>
      {parts.map((part, index) => (
        <span
          key={`${part.status}-${index}`}
          className={styles.part}
          title={DUTY_STATUS_LABELS[part.status]}
          style={{
            flexGrow: part.weight / total,
            background: DUTY_STATUS_COLORS[part.status],
            animationDelay: `${index * 40}ms`,
          }}
        />
      ))}
    </div>
  )
}
