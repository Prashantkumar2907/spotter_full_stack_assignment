import { Check, ClipboardList, Route, ShieldCheck, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cx } from '../../utils/cx'
import styles from './LoadingScreen.module.css'

const STEP_MS = 900

const STEPS: Array<{ icon: LucideIcon; text: string }> = [
  { icon: Route, text: 'Finding the route' },
  { icon: ShieldCheck, text: 'Applying HOS rules' },
  { icon: ClipboardList, text: 'Drawing daily logs' },
]

function useStep(): number {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setStep((current) => Math.min(current + 1, STEPS.length - 1)), STEP_MS)
    return () => window.clearInterval(timer)
  }, [])
  return step
}

function Road() {
  return (
    <svg className={styles.road} viewBox="0 0 320 90" aria-hidden="true">
      <rect x="0" y="58" width="320" height="22" rx="4" className={styles.asphalt} />
      <line x1="0" y1="69" x2="320" y2="69" className={styles.lane} />
      <g className={styles.truck}>
        <rect x="118" y="22" width="58" height="34" rx="4" className={styles.trailer} />
        <path d="M178 30h22l14 14v12h-36z" className={styles.cab} />
        <rect x="186" y="34" width="12" height="9" rx="1.5" className={styles.window} />
        <circle cx="136" cy="58" r="7" className={styles.wheel} />
        <circle cx="160" cy="58" r="7" className={styles.wheel} />
        <circle cx="200" cy="58" r="7" className={styles.wheel} />
      </g>
    </svg>
  )
}

export function LoadingScreen() {
  const step = useStep()
  return (
    <div className={`ink ${styles.overlay}`} role="status" aria-live="polite">
      <div className={styles.card}>
        <Road />
        <h2 className={styles.title}>Planning your trip</h2>
        <ol className={styles.steps}>
          {STEPS.map(({ icon: Icon, text }, index) => {
            const state = index < step ? styles.done : index === step ? styles.active : styles.pending
            return (
              <li key={text} className={cx(styles.step, state)}>
                <span className={styles.badge}>{index < step ? <Check size={14} /> : <Icon size={14} />}</span>
                {text}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
