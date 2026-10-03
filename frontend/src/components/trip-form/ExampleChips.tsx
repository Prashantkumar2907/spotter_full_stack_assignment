import { MapPinned, ScrollText, TimerReset, Truck, type LucideIcon } from 'lucide-react'
import { TRIP_EXAMPLES, type TripExample } from '../../constants/examples'
import styles from './ExampleChips.module.css'

const ICONS: Record<string, LucideIcon> = {
  'fmcsa-sample': ScrollText,
  'midwest-south': Truck,
  'cross-country': MapPinned,
  'cycle-limit': TimerReset,
}

interface ExampleChipsProps {
  onPick: (example: TripExample) => void
  disabled: boolean
}

export function ExampleChips({ onPick, disabled }: ExampleChipsProps) {
  return (
    <section className={styles.section} aria-labelledby="examples-heading">
      <h2 id="examples-heading" className={styles.heading}>
        Or load an example trip
      </h2>
      <div className={styles.grid}>
        {TRIP_EXAMPLES.map((example) => {
          const Icon = ICONS[example.id] ?? Truck
          return (
            <button
              key={example.id}
              type="button"
              className={styles.chip}
              title={`${example.title}: ${example.summary}`}
              disabled={disabled}
              onClick={() => onPick(example)}
            >
              <Icon size={16} aria-hidden="true" className={styles.icon} />
              <span className={styles.label}>{example.shortTitle}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
