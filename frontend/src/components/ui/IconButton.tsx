import { ActionIcon, Tooltip, type ActionIconVariant } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'> {
  icon: LucideIcon
  label: string
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'outline' | 'solid'
  tooltip?: 'top' | 'bottom' | 'left' | 'none'
  loading?: boolean
}

const ICON_SIZE = { sm: 16, md: 18 }
const BUTTON_SIZE = { sm: 32, md: 40 }

const VARIANTS: Record<NonNullable<IconButtonProps['variant']>, { variant: ActionIconVariant; color?: string }> = {
  ghost: { variant: 'subtle', color: 'gray' },
  outline: { variant: 'default' },
  solid: { variant: 'filled' },
}

export function IconButton({
  icon: Icon,
  label,
  size = 'md',
  variant = 'ghost',
  tooltip = 'bottom',
  loading = false,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip label={label} position={tooltip === 'none' ? 'bottom' : tooltip} disabled={tooltip === 'none'}>
      <ActionIcon
        type={type}
        aria-label={label}
        size={BUTTON_SIZE[size]}
        loading={loading}
        {...VARIANTS[variant]}
        {...rest}
      >
        <Icon size={ICON_SIZE[size]} aria-hidden="true" />
      </ActionIcon>
    </Tooltip>
  )
}
