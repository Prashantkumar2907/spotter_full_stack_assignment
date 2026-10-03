import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './FieldShell.module.css'

interface FieldShellProps {
  id: string
  label: string
  hint?: string
  hintTone?: 'muted' | 'warning'
  error?: string
  action?: ReactNode
  children: ReactNode
}

export function FieldShell({ id, label, hint, hintTone = 'muted', error, action, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <div className={styles.header}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={`${styles.hint} ${styles[hintTone]}`} aria-live="polite">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
