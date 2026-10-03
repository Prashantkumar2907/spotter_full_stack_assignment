import { Flag, LocateFixed, PackageOpen, type LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { TripFormController } from '../../hooks/useTripForm'
import type { LocationKey, LocationValue } from '../../types/form'
import { LocationField } from './LocationField'
import styles from './RouteFields.module.css'

interface RouteFieldConfig {
  key: LocationKey
  label: string
  placeholder: string
  icon: LucideIcon
  tone: string
}

const FIELDS: RouteFieldConfig[] = [
  { key: 'current', label: 'Current location', placeholder: 'City, address or place', icon: LocateFixed, tone: 'var(--stop-start)' },
  { key: 'pickup', label: 'Pickup', placeholder: 'Where you load', icon: PackageOpen, tone: 'var(--stop-pickup)' },
  { key: 'dropoff', label: 'Drop-off', placeholder: 'Where you deliver', icon: Flag, tone: 'var(--stop-dropoff)' },
]

function isFilled(value: LocationValue): boolean {
  return value.place !== null || value.text.trim() !== ''
}

function Connector({ active }: { active: boolean }) {
  return (
    <span className={styles.connector} data-active={active} aria-hidden="true">
      <span className={styles.spark} />
    </span>
  )
}

export function RouteFields({ form }: { form: TripFormController }) {
  const filled = FIELDS.map(({ key }) => isFilled(form.values[key]))
  return (
    <ol className={styles.route} aria-label="Route">
      {FIELDS.map(({ key, label, placeholder, icon: Icon, tone }, index) => (
        <li
          key={key}
          className={styles.stop}
          data-filled={filled[index]}
          style={{ '--tone': tone, '--next-tone': FIELDS[index + 1]?.tone ?? tone } as CSSProperties}
        >
          <span className={styles.node} aria-hidden="true">
            <Icon size={14} strokeWidth={2.6} />
          </span>
          {index < FIELDS.length - 1 && <Connector active={filled[index] && filled[index + 1]} />}
          <LocationField
            label={label}
            placeholder={placeholder}
            value={form.values[key]}
            error={form.errors[key]}
            onChange={(value) => form.setLocation(key, value)}
          />
        </li>
      ))}
    </ol>
  )
}
