import { ArrowRight, RotateCw, Route } from 'lucide-react'
import { isRetryable, type ApiError } from '../../api/client'
import type { TripFormController } from '../../hooks/useTripForm'
import { cx } from '../../utils/cx'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { CycleHoursField } from './CycleHoursField'
import { DepartureField } from './DepartureField'
import { LogDetailsFields } from './LogDetailsFields'
import { RouteFields } from './RouteFields'
import styles from './TripForm.module.css'

export const EDIT_FORM_ID = 'edit-trip-form'

interface TripFormProps {
  form: TripFormController
  loading: boolean
  error: ApiError | null
  mode?: 'new' | 'edit'
  onRetry?: () => void
}

function PlanError({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  const action = onRetry && isRetryable(error) && (
    <Button variant="secondary" size="sm" icon={RotateCw} onClick={onRetry}>
      Try again
    </Button>
  )
  return (
    <Alert title="Couldn't plan this trip" action={action}>
      {error.message}
    </Alert>
  )
}

function ScheduleRow({ form }: { form: TripFormController }) {
  const { values, errors, setField } = form
  return (
    <div className={styles.row}>
      <CycleHoursField
        value={values.cycleUsed}
        error={errors.cycleUsed}
        onChange={(value) => setField('cycleUsed', value)}
      />
      <DepartureField value={values.startTime} error={errors.startTime} onChange={(value) => setField('startTime', value)} />
    </div>
  )
}

export function TripForm({ form, loading, error, mode = 'new', onRetry }: TripFormProps) {
  const editing = mode === 'edit'
  return (
    <form
      id={editing ? EDIT_FORM_ID : undefined}
      className={cx(styles.form, editing ? styles.plain : styles.card)}
      onSubmit={form.submit}
      noValidate
      aria-label={editing ? 'Edit trip' : undefined}
      aria-labelledby={editing ? undefined : 'trip-form-title'}
    >
      {!editing && (
        <h2 id="trip-form-title" className={styles.title}>
          Plan a trip
        </h2>
      )}
      {error && <PlanError error={error} onRetry={onRetry} />}
      <RouteFields form={form} />
      <ScheduleRow form={form} />
      <LogDetailsFields values={form.values.details} onChange={form.setDetail} inline={editing} />
      {!editing && (
        <Button type="submit" size="lg" fullWidth icon={Route} trailingIcon={ArrowRight} loading={loading} className={styles.cta}>
          {loading ? 'Planning' : 'Plan trip'}
        </Button>
      )}
    </form>
  )
}
