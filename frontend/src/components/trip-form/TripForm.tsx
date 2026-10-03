import { ArrowRight, CalendarClock, Route } from 'lucide-react'
import type { TripFormController } from '../../hooks/useTripForm'
import { Brand } from '../layout/Brand'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { CycleHoursField } from './CycleHoursField'
import { ExampleChips } from './ExampleChips'
import { LogDetailsFields } from './LogDetailsFields'
import { RouteFields } from './RouteFields'
import styles from './TripForm.module.css'

interface TripFormProps {
  form: TripFormController
  loading: boolean
}

export function TripForm({ form, loading }: TripFormProps) {
  const { values, errors, setField, setDetail, submit, loadExample } = form
  return (
    <aside className={`ink ${styles.sidebar}`} aria-label="Trip details">
      <div className={styles.brandRow}>
        <Brand />
      </div>
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={`${styles.body} scroll-thin`}>
          <h1 className={styles.title}>Plan a trip</h1>
          <RouteFields form={form} />
          <CycleHoursField
            value={values.cycleUsed}
            error={errors.cycleUsed}
            onChange={(value) => setField('cycleUsed', value)}
          />
          <TextField
            label="Departure (home terminal time)"
            type="datetime-local"
            icon={CalendarClock}
            value={values.startTime}
            error={errors.startTime}
            onChange={(event) => setField('startTime', event.target.value)}
          />
          <LogDetailsFields values={values.details} onChange={setDetail} />
          <ExampleChips onPick={loadExample} disabled={loading} />
        </div>
        <div className={styles.footer}>
          <Button type="submit" size="lg" fullWidth icon={Route} trailingIcon={ArrowRight} loading={loading}>
            {loading ? 'Planning trip' : 'Plan trip'}
          </Button>
        </div>
      </form>
    </aside>
  )
}
