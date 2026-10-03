import { DateTimePicker } from '@mantine/dates'
import { CalendarClock } from 'lucide-react'

interface DepartureFieldProps {
  value: string
  error?: string
  onChange: (value: string) => void
}

const VALUE_FORMAT = 'ddd, MMM D · h:mm A'
const MINUTES_STEP = 15
const PICKER_SEPARATOR = ' '
const FORM_SEPARATOR = 'T'
const MINUTE_PRECISION = 16

function toPickerValue(value: string): string | null {
  return value ? `${value.replace(FORM_SEPARATOR, PICKER_SEPARATOR)}:00` : null
}

function toFormValue(value: string | null): string {
  return value ? value.slice(0, MINUTE_PRECISION).replace(PICKER_SEPARATOR, FORM_SEPARATOR) : ''
}

export function DepartureField({ value, error, onChange }: DepartureFieldProps) {
  return (
    <DateTimePicker
      label="Departure"
      description="Home terminal time"
      value={toPickerValue(value)}
      onChange={(next) => onChange(toFormValue(next))}
      valueFormat={VALUE_FORMAT}
      error={error}
      leftSection={<CalendarClock size={18} aria-hidden="true" />}
      timePickerProps={{ format: '12h', minutesStep: MINUTES_STEP, withDropdown: true }}
      weekendDays={[]}
      dropdownType="popover"
      popoverProps={{ position: 'bottom-end' }}
    />
  )
}
