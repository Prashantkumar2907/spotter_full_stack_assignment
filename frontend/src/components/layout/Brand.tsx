import styles from './Brand.module.css'

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className ?? styles.mark} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--color-accent)" />
      <path
        d="M11 28V13l9 10 9-10v15"
        fill="none"
        stroke="var(--color-on-accent)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Brand() {
  return (
    <div className={styles.brand}>
      <BrandMark />
      <p className={styles.name}>Milemark</p>
    </div>
  )
}
