import type { TripExample } from '../../constants/examples'
import { Brand } from '../layout/Brand'
import { ExampleChips } from '../trip-form/ExampleChips'
import styles from './HeroPanel.module.css'
import { RouteIllustration } from './RouteIllustration'

interface HeroPanelProps {
  onPickExample: (example: TripExample) => void
  loading: boolean
}

export function HeroPanel({ onPickExample, loading }: HeroPanelProps) {
  return (
    <section className={`ink ${styles.hero}`} aria-label="Milemark">
      <Brand />
      <div className={styles.copy}>
        <h1 className={styles.title}>Every mile planned. Every hour logged.</h1>
        <p className={styles.lead}>Compliant routes and daily logs for truck drivers.</p>
      </div>
      <div className={styles.illustration}>
        <RouteIllustration />
      </div>
      <ExampleChips onPick={onPickExample} disabled={loading} />
    </section>
  )
}
