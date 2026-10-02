import { CalendarClock, Route } from 'lucide-react'
import type { TripFormController } from '../../hooks/useTripForm'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { TextField } from '../ui/TextField'
import { CycleHoursField } from './CycleHoursField'
import { ExamplePicker } from './ExamplePicker'
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
    <Panel className={styles.panel} aria-label="Trip details">
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={`${styles.fields} scroll-thin`}>
        <h2 className={styles.title}>Plan a trip</h2>
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
        <ExamplePicker onPick={loadExample} />
        </div>
        <div className={styles.footer}>
          <Button type="submit" size="lg" fullWidth icon={Route} loading={loading}>
            {loading ? 'Planning trip' : 'Plan trip'}
          </Button>
        </div>
      </form>
    </Panel>
  )
}
