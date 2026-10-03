import { ChevronRight, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import type { LogDetails } from '../../types/trip'
import { cx } from '../../utils/cx'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { TextField } from '../ui/TextField'
import styles from './LogDetailsFields.module.css'

interface LogDetailsFieldsProps {
  values: LogDetails
  onChange: (key: keyof LogDetails, value: string) => void
  inline?: boolean
}

interface DetailField {
  key: keyof LogDetails
  label: string
  placeholder: string
  autoComplete: string
  wide?: boolean
}

interface DetailGroup {
  title: string
  fields: DetailField[]
}

const GROUPS: DetailGroup[] = [
  {
    title: 'Driver and carrier',
    fields: [
      { key: 'driver_name', label: 'Driver', placeholder: 'Full name', autoComplete: 'name' },
      { key: 'carrier_name', label: 'Carrier', placeholder: 'Company name', autoComplete: 'organization' },
      { key: 'main_office_address', label: 'Main office', placeholder: 'City, State', autoComplete: 'off' },
      { key: 'home_terminal_address', label: 'Home terminal', placeholder: 'City, State', autoComplete: 'off' },
    ],
  },
  {
    title: 'Truck and load',
    fields: [
      { key: 'vehicle_numbers', label: 'Truck and trailer', placeholder: '123, 20544', autoComplete: 'off' },
      { key: 'shipping_document', label: 'Shipping document', placeholder: 'BOL or manifest no.', autoComplete: 'off' },
      { key: 'commodity', label: 'Commodity', placeholder: 'What you are hauling', autoComplete: 'off', wide: true },
    ],
  },
]

const FIELDS = GROUPS.flatMap((group) => group.fields)

const MAX_LENGTH = 200

interface DetailsDialogProps extends Pick<LogDetailsFieldsProps, 'values' | 'onChange'> {
  open: boolean
  onClose: () => void
}

function DetailsGrid({ values, onChange }: Pick<LogDetailsFieldsProps, 'values' | 'onChange'>) {
  return (
    <div className={styles.groups}>
      {GROUPS.map((group) => (
        <fieldset key={group.title} className={styles.group}>
          <legend className={styles.legend}>{group.title}</legend>
          <div className={styles.grid}>
            {group.fields.map(({ key, label, placeholder, autoComplete, wide }) => (
              <div key={key} className={cx(wide && styles.wide)}>
                <TextField
                  label={label}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  value={values[key]}
                  maxLength={MAX_LENGTH}
                  onChange={(event) => onChange(key, event.target.value)}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

function DetailsDialog({ open, values, onChange, onClose }: DetailsDialogProps) {
  const filled = FIELDS.some(({ key }) => values[key] !== '')
  const clearAll = () => FIELDS.forEach(({ key }) => values[key] !== '' && onChange(key, ''))
  return (
    <Dialog
      open={open}
      title="Log sheet details"
      description="Printed on every daily log sheet. All optional."
      size="form"
      onClose={onClose}
      footer={
        <>
          {filled && (
            <Button variant="ghost" onClick={clearAll} className={styles.clear}>
              Clear all
            </Button>
          )}
          <Button onClick={onClose}>Done</Button>
        </>
      }
    >
      <DetailsGrid values={values} onChange={onChange} />
    </Dialog>
  )
}

export function LogDetailsFields({ values, onChange, inline = false }: LogDetailsFieldsProps) {
  const [open, setOpen] = useState(false)
  const added = FIELDS.filter(({ key }) => values[key].trim() !== '').length
  return (
    <>
      <button
        type="button"
        className={cx(styles.trigger, added > 0 && styles.filled)}
        aria-expanded={inline ? open : undefined}
        aria-haspopup={inline ? undefined : 'dialog'}
        onClick={() => setOpen((current) => !current)}
      >
        <ClipboardList size={18} aria-hidden="true" />
        <span className={styles.label}>Log sheet details</span>
        <span className={styles.status}>{added > 0 ? `${added} added` : 'Optional'}</span>
        <ChevronRight size={18} className={cx(styles.chevron, inline && open && styles.expanded)} aria-hidden="true" />
      </button>
      {inline ? (
        open && (
          <div className={styles.inline}>
            <DetailsGrid values={values} onChange={onChange} />
          </div>
        )
      ) : (
        <DetailsDialog open={open} values={values} onChange={onChange} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
