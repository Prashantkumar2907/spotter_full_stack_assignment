import { useMemo, useState } from 'react'
import type { Stop } from '../../types/trip'
import { buildDayEntries, listDays } from '../../utils/itinerary'
import { Panel } from '../ui/Panel'
import { tabButtonId, tabPanelId } from '../ui/tabIds'
import { ITINERARY_TABS_PREFIX, ItineraryHeader } from './ItineraryHeader'
import { DriveConnector, StopItem } from './StopItem'
import styles from './Itinerary.module.css'

interface ItineraryProps {
  stops: Stop[]
  selectedStopId: number | null
  onSelectStop: (id: number) => void
}

export function Itinerary({ stops, selectedStopId, onSelectStop }: ItineraryProps) {
  const days = useMemo(() => listDays(stops), [stops])
  const [day, setDay] = useState(days[0])
  const activeDay = days.includes(day) ? day : days[0]
  const entries = useMemo(() => buildDayEntries(stops, activeDay), [stops, activeDay])
  const stopCount = entries.filter((entry) => entry.kind === 'stop').length

  return (
    <Panel as="aside" className={styles.itinerary} aria-label="Itinerary">
      <ItineraryHeader
        days={days}
        activeDay={activeDay}
        firstStop={stops.find((stop) => stop.day_number === activeDay)}
        stopCount={stopCount}
        onSelectDay={setDay}
      />
      <div
        className={`${styles.body} scroll-thin`}
        role="tabpanel"
        id={tabPanelId(ITINERARY_TABS_PREFIX)}
        aria-labelledby={tabButtonId(ITINERARY_TABS_PREFIX, String(activeDay))}
      >
        <ol className={styles.list} key={activeDay}>
          {entries.map((entry, index) =>
            entry.kind === 'drive' ? (
              <DriveConnector key={entry.key} miles={entry.miles} minutes={entry.minutes} index={index} />
            ) : (
              <StopItem
                key={entry.key}
                stop={entry.stop}
                index={index}
                selected={entry.stop.id === selectedStopId}
                onSelect={onSelectStop}
              />
            ),
          )}
        </ol>
      </div>
    </Panel>
  )
}
