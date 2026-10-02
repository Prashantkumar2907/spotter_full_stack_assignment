import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import styles from './Button.module.css'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  trailingIcon?: LucideIcon
  loading?: boolean
  fullWidth?: boolean
}

const ICON_SIZE: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 }

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  trailingIcon: TrailingIcon,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const iconSize = ICON_SIZE[size]
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.full, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={iconSize} /> : Icon && <Icon size={iconSize} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
      {TrailingIcon && !loading && (
        <TrailingIcon size={iconSize} className={styles.trailing} aria-hidden="true" />
      )}
    </button>
  )
}
