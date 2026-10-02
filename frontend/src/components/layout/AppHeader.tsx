import { ShieldCheck } from 'lucide-react'
import { Badge } from '../ui/Badge'
import styles from './AppHeader.module.css'

function BrandMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <rect x="6" y="6" width="52" height="52" rx="9" fill="none" stroke="var(--color-on-accent)" strokeWidth="3" />
      <path
        d="M20 44V22l12 14 12-14v22"
        fill="none"
        stroke="var(--color-on-accent)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AppHeader({ loading }: { loading: boolean }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <BrandMark />
        <div>
          <h1 className={styles.name}>Milemark</h1>
          <p className={styles.tagline}>ELD trip planner</p>
        </div>
      </div>
      <Badge tone="accent" icon={ShieldCheck}>
        70 hr / 8 day rules
      </Badge>
      {loading && <div className={styles.progress} role="progressbar" aria-label="Planning trip" />}
    </header>
  )
}
