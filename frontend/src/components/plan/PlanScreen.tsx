import { ArrowLeft } from 'lucide-react'
import type { ApiError } from '../../api/client'
import type { TripFormController } from '../../hooks/useTripForm'
import { TripForm } from '../trip-form/TripForm'
import { Button } from '../ui/Button'
import { HeroPanel } from './HeroPanel'
import styles from './PlanScreen.module.css'

interface PlanScreenProps {
  form: TripFormController
  loading: boolean
  error: ApiError | null
  onBackToResults?: () => void
}

export function PlanScreen({ form, loading, error, onBackToResults }: PlanScreenProps) {
  return (
    <main className={styles.screen}>
      <HeroPanel onPickExample={form.loadExample} loading={loading} />
      <section className={`${styles.formSide} scroll-thin`} aria-label="Trip form">
        {onBackToResults && (
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBackToResults} className={styles.back}>
            Back to results
          </Button>
        )}
        <TripForm form={form} loading={loading} error={error} />
      </section>
    </main>
  )
}
