import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './ControlFrame.module.css'

interface ControlFrameProps {
  children: ReactNode
  icon?: LucideIcon
  leading?: ReactNode
  trailing?: ReactNode
  invalid?: boolean
  disabled?: boolean
  className?: string
}

export function ControlFrame({
  children,
  icon: Icon,
  leading,
  trailing,
  invalid = false,
  disabled = false,
  className,
}: ControlFrameProps) {
  return (
    <div className={cx(styles.frame, invalid && styles.invalid, disabled && styles.disabled, className)}>
      {leading ?? (Icon && <Icon size={18} className={styles.icon} aria-hidden="true" />)}
      {children}
      {trailing && <div className={styles.trailing}>{trailing}</div>}
    </div>
  )
}
