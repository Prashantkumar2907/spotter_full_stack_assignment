import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: number
  label?: string
}

export function Spinner({ size = 18, label }: SpinnerProps) {
  return (
    <span className={styles.spinner} role={label ? 'status' : undefined} aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className={styles.track} cx="12" cy="12" r="9" strokeWidth="3" />
        <path className={styles.arc} d="M21 12a9 9 0 0 0-9-9" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  )
}
