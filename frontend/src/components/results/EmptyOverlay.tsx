import { ClipboardCheck, Gauge, MapPinned, Play } from 'lucide-react'
import { Button } from '../ui/Button'
import styles from './EmptyOverlay.module.css'

const STEPS = [
  { icon: MapPinned, title: 'Add the route', text: 'Where the truck is, where it loads and where it delivers.' },
  { icon: Gauge, title: 'Add cycle hours', text: 'Hours already used in the 70 hour / 8 day cycle.' },
  {
    icon: ClipboardCheck,
    title: 'Get a legal plan',
    text: 'Every fuel stop, break and rest, plus a filled-out log for each day.',
  },
]

export function EmptyOverlay({ onTrySample }: { onTrySample: () => void }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>Plan a compliant trip in seconds</h2>
        <ol className={styles.steps}>
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className={styles.step} style={{ ['--i' as string]: index }}>
              <span className={styles.icon}>
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>
                <strong className={styles.stepTitle}>{title}</strong>
                <span className={styles.stepText}>{text}</span>
              </span>
            </li>
          ))}
        </ol>
        <Button icon={Play} onClick={onTrySample}>
          Try the FMCSA sample day
        </Button>
      </div>
    </div>
  )
}
