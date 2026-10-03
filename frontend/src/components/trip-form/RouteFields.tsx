import { Flag, LocateFixed, PackageOpen, type LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { TripFormController } from '../../hooks/useTripForm'
import type { LocationKey } from '../../types/form'
import { LocationField } from './LocationField'
import styles from './RouteFields.module.css'

interface RouteFieldsProps {
  form: TripFormController
}

interface RouteFieldConfig {
  key: LocationKey
  label: string
  placeholder: string
  icon: LucideIcon
  tone: string
  glyph: string
}

const FIELDS: RouteFieldConfig[] = [
  {
    key: 'current',
    label: 'Current location',
    placeholder: 'Where is the truck now?',
    icon: LocateFixed,
    tone: 'var(--color-text)',
    glyph: 'var(--color-bg)',
  },
  {
    key: 'pickup',
    label: 'Pickup location',
    placeholder: 'Where do you load?',
    icon: PackageOpen,
    tone: 'var(--stop-pickup)',
    glyph: '#ffffff',
  },
  {
    key: 'dropoff',
    label: 'Drop-off location',
    placeholder: 'Where do you deliver?',
    icon: Flag,
    tone: 'var(--stop-dropoff)',
    glyph: '#ffffff',
  },
]

export function RouteFields({ form }: RouteFieldsProps) {
  return (
    <ol className={styles.route} aria-label="Route">
      {FIELDS.map(({ key, label, placeholder, icon: Icon, tone, glyph }) => (
        <li key={key} className={styles.stop} style={{ '--tone': tone, '--glyph': glyph } as CSSProperties}>
          <span className={styles.node} aria-hidden="true">
            <Icon size={14} strokeWidth={2.6} />
          </span>
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
