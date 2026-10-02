import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'accent' | 'amber' | 'blue' | 'danger'

interface BadgeProps {
  tone?: BadgeTone
  icon?: LucideIcon
  children: ReactNode
}

export function Badge({ tone = 'neutral', icon: Icon, children }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone])}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  )
}
