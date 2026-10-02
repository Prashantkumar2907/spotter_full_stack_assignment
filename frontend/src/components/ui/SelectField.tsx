import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ControlFrame } from './ControlFrame'
import { FieldShell } from './FieldShell'
import { fieldDescribedBy } from './fieldIds'
import styles from './SelectField.module.css'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> {
  label: string
  options: SelectOption[]
  placeholder?: string
  hint?: string
  error?: string
  icon?: LucideIcon
}

export function SelectField({
  label,
  options,
  placeholder,
  hint,
  error,
  icon,
  ...rest
}: SelectFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <ControlFrame
        icon={icon}
        invalid={Boolean(error)}
        trailing={<ChevronDown size={18} aria-hidden="true" />}
      >
        <select
          id={id}
          className={styles.select}
          aria-describedby={fieldDescribedBy(id, hint, error)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </ControlFrame>
    </FieldShell>
  )
}
