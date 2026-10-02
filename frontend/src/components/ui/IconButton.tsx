import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import styles from './IconButton.module.css'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon
  label: string
  size?: 'sm' | 'md'
  tone?: 'neutral' | 'accent'
}

const ICON_SIZE = { sm: 16, md: 18 }

export function IconButton({
  icon: Icon,
  label,
  size = 'md',
  tone = 'neutral',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(styles.button, styles[size], styles[tone], className)}
      {...rest}
    >
      <Icon size={ICON_SIZE[size]} aria-hidden="true" />
    </button>
  )
}
