import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import { MAX_CYCLE_HOURS } from '../../constants/duty'
import { CYCLE_STEP_HOURS, NEAR_CYCLE_LIMIT_RATIO } from '../../constants/limits'
import { clampCycleHours } from '../../utils/formValues'
import { parseCycleHours } from '../../utils/validation'
import { ControlFrame } from '../ui/ControlFrame'
import { FieldShell } from '../ui/FieldShell'
import { fieldDescribedBy } from '../ui/fieldIds'
import { IconButton } from '../ui/IconButton'
import styles from './CycleHoursField.module.css'

interface CycleHoursFieldProps {
  value: string
  error?: string
  onChange: (value: string) => void
}

const STEP_HOURS = CYCLE_STEP_HOURS * 2
const DEFAULT_HINT = 'On duty in the last 8 days'

function formatHoursShort(hours: number): string {
  return String(Number(hours.toFixed(2)))
}

function cycleHint(hours: number | null): { text: string; warning: boolean } {
  if (hours === null || hours / MAX_CYCLE_HOURS < NEAR_CYCLE_LIMIT_RATIO) return { text: DEFAULT_HINT, warning: false }
  const left = Math.max(0, MAX_CYCLE_HOURS - hours)
  return { text: `Only ${formatHoursShort(left)} h left, a 34 h restart is likely`, warning: true }
}

function Stepper({ hours, onChange }: { hours: number | null; onChange: (value: string) => void }) {
  const step = (direction: 1 | -1) =>
    onChange(clampCycleHours((hours ?? 0) + direction * STEP_HOURS, MAX_CYCLE_HOURS))
  return (
    <>
      <IconButton icon={Minus} label="Decrease cycle hours" size="sm" tooltip="none" disabled={(hours ?? 0) <= 0} onClick={() => step(-1)} />
      <IconButton icon={Plus} label="Increase cycle hours" size="sm" tooltip="none" disabled={(hours ?? 0) >= MAX_CYCLE_HOURS} onClick={() => step(1)} />
    </>
  )
}

export function CycleHoursField({ value, error, onChange }: CycleHoursFieldProps) {
  const id = useId()
  const hours = parseCycleHours(value)
  const hint = cycleHint(hours)
  return (
    <FieldShell id={id} label="Cycle used (hrs)" hint={hint.text} hintTone={hint.warning ? 'warning' : 'muted'} error={error}>
      <ControlFrame trailing={<Stepper hours={hours} onChange={onChange} />} invalid={Boolean(error)}>
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
          aria-describedby={fieldDescribedBy(id, hint.text, error)}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className={styles.suffix} aria-hidden="true">
          of {MAX_CYCLE_HOURS} h
        </span>
      </ControlFrame>
    </FieldShell>
  )
}
