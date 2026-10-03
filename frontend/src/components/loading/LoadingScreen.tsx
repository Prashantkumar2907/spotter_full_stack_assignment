import { Check, ClipboardList, Route, ShieldCheck, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cx } from '../../utils/cx'
import { RouteIllustration } from '../plan/RouteIllustration'
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

export function LoadingScreen() {
  const step = useStep()
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.card}>
        <div className={styles.scene}>
          <RouteIllustration />
        </div>
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
