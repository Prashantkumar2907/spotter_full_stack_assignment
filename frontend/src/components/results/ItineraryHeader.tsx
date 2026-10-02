import type { Stop } from '../../types/trip'
import { pluralize } from '../../utils/format'
import { formatLongDay } from '../../utils/time'
import { Tabs } from '../ui/Tabs'
import styles from './Itinerary.module.css'

export const ITINERARY_TABS_PREFIX = 'itinerary-days'

interface ItineraryHeaderProps {
  days: number[]
  activeDay: number
  firstStop: Stop | undefined
  stopCount: number
  onSelectDay: (day: number) => void
}

export function ItineraryHeader({
  days,
  activeDay,
  firstStop,
  stopCount,
  onSelectDay,
}: ItineraryHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Itinerary</h2>
        {firstStop && (
          <p className={styles.date}>
            {formatLongDay(firstStop.arrive)} · {pluralize(stopCount, 'stop')}
          </p>
        )}
      </div>
      {days.length > 1 && (
        <Tabs
          label="Itinerary days"
          idPrefix={ITINERARY_TABS_PREFIX}
          variant="pill"
          value={String(activeDay)}
          onChange={(id) => onSelectDay(Number(id))}
          items={days.map((value) => ({ id: String(value), label: `Day ${value}` }))}
        />
      )}
    </header>
  )
}
