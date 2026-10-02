import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { ControlFrame } from './ControlFrame'
import { FieldShell } from './FieldShell'
import { fieldDescribedBy } from './fieldIds'
import styles from './TextField.module.css'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  error?: string
  icon?: LucideIcon
  trailing?: ReactNode
}

export function TextField({ label, hint, error, icon, trailing, ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <ControlFrame icon={icon} trailing={trailing} invalid={Boolean(error)} disabled={rest.disabled}>
        <input
          id={id}
          className={styles.input}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={fieldDescribedBy(id, hint, error)}
          {...rest}
        />
      </ControlFrame>
    </FieldShell>
  )
}
