import { ClipboardList } from 'lucide-react'
import type { LogDetails } from '../../types/trip'
import { Disclosure } from '../ui/Disclosure'
import { TextField } from '../ui/TextField'

interface LogDetailsFieldsProps {
  values: LogDetails
  onChange: (key: keyof LogDetails, value: string) => void
}

const FIELDS: Array<{ key: keyof LogDetails; label: string; placeholder: string }> = [
  { key: 'driver_name', label: 'Driver name', placeholder: 'Full legal name' },
  { key: 'carrier_name', label: 'Name of carrier', placeholder: 'Motor carrier' },
  { key: 'main_office_address', label: 'Main office address', placeholder: 'City, State' },
  { key: 'home_terminal_address', label: 'Home terminal address', placeholder: 'City, State' },
  { key: 'vehicle_numbers', label: 'Truck and trailer numbers', placeholder: 'e.g. 123, 20544' },
  { key: 'shipping_document', label: 'DVL or manifest number', placeholder: 'Shipping document' },
  { key: 'commodity', label: 'Shipper and commodity', placeholder: 'What you are hauling' },
]

export function LogDetailsFields({ values, onChange }: LogDetailsFieldsProps) {
  return (
    <Disclosure title="Log sheet details (optional)" icon={ClipboardList}>
      {FIELDS.map(({ key, label, placeholder }) => (
        <TextField
          key={key}
          label={label}
          placeholder={placeholder}
          value={values[key]}
          maxLength={200}
          onChange={(event) => onChange(key, event.target.value)}
        />
      ))}
    </Disclosure>
  )
}
