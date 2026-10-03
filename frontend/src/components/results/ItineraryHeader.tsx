import { pluralize } from '../../utils/format'
import { formatDay } from '../../utils/time'
import { Tabs } from '../ui/Tabs'
import styles from './Itinerary.module.css'

export const ITINERARY_TABS_PREFIX = 'itinerary-days'

interface ItineraryHeaderProps {
  days: number[]
  activeDay: number
  dayStart: string
  stopCount: number
  onSelectDay: (day: number) => void
}

export function ItineraryHeader({
  days,
  activeDay,
  dayStart,
  stopCount,
  onSelectDay,
}: ItineraryHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Itinerary</h2>
        <p className={styles.date}>
          {formatDay(dayStart)} · {pluralize(stopCount, 'stop')}
        </p>
      </div>
      {days.length > 1 && (
        <Tabs
          label="Itinerary days"
          idPrefix={ITINERARY_TABS_PREFIX}
          variant="pill"
          value={String(activeDay)}
          onChange={(id) => onSelectDay(Number(id))}
          items={days.map((value) => ({ id: String(value), label: `Day ${value}` }))}
          compact
        />
      )}
    </header>
  )
}
