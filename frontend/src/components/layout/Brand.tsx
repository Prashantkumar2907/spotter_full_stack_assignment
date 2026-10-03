import styles from './Brand.module.css'

export function Brand() {
  return (
    <div className={styles.brand}>
      <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="var(--color-accent)" />
        <path
          d="M11 28V13l9 10 9-10v15"
          fill="none"
          stroke="var(--color-on-accent)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className={styles.text}>
        <p className={styles.name}>Milemark</p>
        <p className={styles.tagline}>ELD trip planner</p>
      </div>
      <span className={styles.rule}>FMCSA 70 h / 8 day</span>
    </div>
  )
}
