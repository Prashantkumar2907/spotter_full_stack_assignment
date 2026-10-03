import { Button as MantineButton, type ButtonVariant as MantineVariant } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  trailingIcon?: LucideIcon
  loading?: boolean
  fullWidth?: boolean
}

const VARIANTS: Record<ButtonVariant, { variant: MantineVariant; color?: string }> = {
  primary: { variant: 'filled' },
  secondary: { variant: 'default' },
  ghost: { variant: 'subtle', color: 'gray' },
  danger: { variant: 'light', color: 'red' },
}

const ICON_SIZE: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 }
const MANTINE_SIZE: Record<ButtonSize, string> = { sm: 'sm', md: 'md', lg: 'lg' }

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  trailingIcon: TrailingIcon,
  loading = false,
  fullWidth = false,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const iconSize = ICON_SIZE[size]
  return (
    <MantineButton
      type={type}
      {...VARIANTS[variant]}
      size={MANTINE_SIZE[size]}
      loading={loading}
      fullWidth={fullWidth}
      leftSection={Icon && <Icon size={iconSize} aria-hidden="true" />}
      rightSection={TrailingIcon && <TrailingIcon size={iconSize} className={styles.trailing} aria-hidden="true" />}
      className={cx(styles.button, className)}
      {...rest}
    >
      {children}
    </MantineButton>
  )
}
