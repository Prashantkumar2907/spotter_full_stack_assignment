import { TextInput } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'size'> {
  label: string
  hint?: string
  error?: string
  icon?: LucideIcon
  trailing?: ReactNode
}

export function TextField({ label, hint, error, icon: Icon, trailing, ...rest }: TextFieldProps) {
  return (
    <TextInput
      label={label}
      description={hint}
      error={error}
      leftSection={Icon && <Icon size={18} aria-hidden="true" />}
      rightSection={trailing}
      {...rest}
    />
  )
}
