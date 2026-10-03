import { ChevronRight, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import type { LogDetails } from '../../types/trip'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { TextField } from '../ui/TextField'
import styles from './LogDetailsFields.module.css'

interface LogDetailsFieldsProps {
  values: LogDetails
  onChange: (key: keyof LogDetails, value: string) => void
}

const FIELDS: Array<{ key: keyof LogDetails; label: string; placeholder: string }> = [
  { key: 'driver_name', label: 'Driver', placeholder: 'Full name' },
  { key: 'carrier_name', label: 'Carrier', placeholder: 'Company name' },
  { key: 'main_office_address', label: 'Main office', placeholder: 'City, State' },
  { key: 'home_terminal_address', label: 'Home terminal', placeholder: 'City, State' },
  { key: 'vehicle_numbers', label: 'Truck and trailer', placeholder: '123, 20544' },
  { key: 'shipping_document', label: 'Shipping document', placeholder: 'BOL or manifest number' },
  { key: 'commodity', label: 'Commodity', placeholder: 'What you are hauling' },
]

export function LogDetailsFields({ values, onChange }: LogDetailsFieldsProps) {
  const [open, setOpen] = useState(false)
  const added = FIELDS.filter(({ key }) => values[key].trim() !== '').length
  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        <ClipboardList size={18} aria-hidden="true" />
        <span className={styles.label}>Log sheet details</span>
        <span className={styles.status}>{added > 0 ? `${added} added` : 'Optional'}</span>
        <ChevronRight size={18} className={styles.chevron} aria-hidden="true" />
      </button>
      <Dialog open={open} title="Log sheet details" size="form" onClose={() => setOpen(false)}>
        <div className={styles.grid}>
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
        </div>
        <Button className={styles.done} onClick={() => setOpen(false)}>
          Done
        </Button>
      </Dialog>
    </>
  )
}
