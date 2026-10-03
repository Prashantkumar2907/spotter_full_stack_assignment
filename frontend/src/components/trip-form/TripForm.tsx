import { ArrowRight, Route } from 'lucide-react'
import type { ApiError } from '../../api/client'
import type { TripFormController } from '../../hooks/useTripForm'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { CycleHoursField } from './CycleHoursField'
import { LogDetailsFields } from './LogDetailsFields'
import { RouteFields } from './RouteFields'
import styles from './TripForm.module.css'

interface TripFormProps {
  form: TripFormController
  loading: boolean
  error: ApiError | null
}

export function TripForm({ form, loading, error }: TripFormProps) {
  const { values, errors, setField, setDetail, submit } = form
  return (
    <form className={styles.card} onSubmit={submit} noValidate aria-labelledby="trip-form-title">
      <h2 id="trip-form-title" className={styles.title}>
        Plan a trip
      </h2>
      {error && <Alert title="Couldn't plan this trip">{error.message}</Alert>}
      <RouteFields form={form} />
      <div className={styles.row}>
        <CycleHoursField
          value={values.cycleUsed}
          error={errors.cycleUsed}
          onChange={(value) => setField('cycleUsed', value)}
        />
        <TextField
          label="Departure"
          type="datetime-local"
          value={values.startTime}
          error={errors.startTime}
          onChange={(event) => setField('startTime', event.target.value)}
        />
      </div>
      <LogDetailsFields values={values.details} onChange={setDetail} />
      <Button type="submit" size="lg" fullWidth icon={Route} trailingIcon={ArrowRight} loading={loading} className={styles.cta}>
        {loading ? 'Planning' : 'Plan trip'}
      </Button>
    </form>
  )
}
