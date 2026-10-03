import { Gauge, Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import { MAX_CYCLE_HOURS } from '../../constants/duty'
import { CYCLE_STEP_HOURS } from '../../constants/limits'
import { clampCycleHours } from '../../utils/formValues'
import { parseCycleHours } from '../../utils/validation'
import { ControlFrame } from '../ui/ControlFrame'
import { FieldShell } from '../ui/FieldShell'
import { fieldDescribedBy } from '../ui/fieldIds'
import { IconButton } from '../ui/IconButton'
import { Meter } from '../ui/Meter'
import styles from './CycleHoursField.module.css'

interface CycleHoursFieldProps {
  value: string
  error?: string
  onChange: (value: string) => void
}

const STEP_HOURS = CYCLE_STEP_HOURS * 2

function formatHoursShort(hours: number): string {
  return String(Number(hours.toFixed(2)))
}

function Stepper({ hours, onChange }: { hours: number | null; onChange: (value: string) => void }) {
  const step = (direction: 1 | -1) =>
    onChange(clampCycleHours((hours ?? 0) + direction * STEP_HOURS, MAX_CYCLE_HOURS))
  return (
    <>
      <IconButton icon={Minus} label="Decrease cycle hours" size="sm" onClick={() => step(-1)} />
      <IconButton icon={Plus} label="Increase cycle hours" size="sm" onClick={() => step(1)} />
    </>
  )
}

function Remaining({ hours }: { hours: number | null }) {
  const text =
    hours === null
      ? `0 to ${MAX_CYCLE_HOURS} hours`
      : `${formatHoursShort(MAX_CYCLE_HOURS - hours)} of ${MAX_CYCLE_HOURS} h left`
  return (
    <div className={styles.meter}>
      <Meter value={hours ?? 0} max={MAX_CYCLE_HOURS} label="Cycle hours used" />
      <p className={styles.remaining} aria-live="polite">
        {text}
      </p>
    </div>
  )
}

export function CycleHoursField({ value, error, onChange }: CycleHoursFieldProps) {
  const id = useId()
  const hours = parseCycleHours(value)
  return (
    <FieldShell id={id} label="Cycle used (hrs)" error={error}>
      <ControlFrame icon={Gauge} trailing={<Stepper hours={hours} onChange={onChange} />} invalid={Boolean(error)}>
        <input
          id={id}
          className={styles.input}
          type="number"
          inputMode="decimal"
          min={0}
          max={MAX_CYCLE_HOURS}
          step={CYCLE_STEP_HOURS}
          value={value}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={fieldDescribedBy(id, undefined, error)}
          onChange={(event) => onChange(event.target.value)}
        />
      </ControlFrame>
      <Remaining hours={hours} />
    </FieldShell>
  )
}
