import type { ApiError } from '../../api/client'
import type { TripFormController } from '../../hooks/useTripForm'
import { ColorSchemeToggle } from '../layout/ColorSchemeToggle'
import { TripForm } from '../trip-form/TripForm'
import { HeroPanel } from './HeroPanel'
import styles from './PlanScreen.module.css'

interface PlanScreenProps {
  form: TripFormController
  loading: boolean
  error: ApiError | null
  onRetry: () => void
}

export function PlanScreen({ form, loading, error, onRetry }: PlanScreenProps) {
  return (
    <main className={styles.screen}>
      <HeroPanel onPickExample={form.loadExample} loading={loading} />
      <section className={`${styles.formSide} scroll-thin`} aria-label="Trip form">
        <div className={styles.column}>
          <TripForm form={form} loading={loading} error={error} onRetry={onRetry} />
        </div>
      </section>
      <ColorSchemeToggle className={styles.theme} tooltip="left" />
    </main>
  )
}
