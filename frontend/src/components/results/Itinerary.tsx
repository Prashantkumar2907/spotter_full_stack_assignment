import { useMemo, useState } from 'react'
import { STOP_KIND_LABELS } from '../../constants/duty'
import type { DailyLog, Stop } from '../../types/trip'
import { buildDayEntries, listDays, ongoingStop } from '../../utils/itinerary'
import { formatDateTime } from '../../utils/time'
import { Panel } from '../ui/Panel'
import { tabButtonId, tabPanelId } from '../ui/tabIds'
import { ITINERARY_TABS_PREFIX, ItineraryHeader } from './ItineraryHeader'
import { DriveConnector, StopItem } from './StopItem'
import styles from './Itinerary.module.css'

interface ItineraryProps {
  stops: Stop[]
  logs: DailyLog[]
  selectedStopId: number | null
  onSelectStop: (id: number) => void
}

function CarryOver({ stop }: { stop: Stop | undefined }) {
  if (!stop) return <p className={styles.carry}>No stops start on this day.</p>
  return (
    <p className={styles.carry}>
      {STOP_KIND_LABELS[stop.kind]} at {stop.location} continues until {formatDateTime(stop.depart)}.
    </p>
  )
}

export function Itinerary({ stops, logs, selectedStopId, onSelectStop }: ItineraryProps) {
  const days = useMemo(() => listDays(logs.length), [logs.length])
  const [day, setDay] = useState(1)
  const entries = useMemo(() => buildDayEntries(stops, day), [stops, day])
  const dayStart = `${logs[day - 1].date}T00:00:00`

  return (
    <Panel as="aside" className={styles.itinerary} aria-label="Itinerary">
      <ItineraryHeader
        days={days}
        activeDay={day}
        dayStart={dayStart}
        stopCount={entries.filter((entry) => entry.kind === 'stop').length}
        onSelectDay={setDay}
      />
      <div
        className={`${styles.body} scroll-thin`}
        role="tabpanel"
        id={tabPanelId(ITINERARY_TABS_PREFIX)}
        aria-labelledby={tabButtonId(ITINERARY_TABS_PREFIX, String(day))}
      >
        {entries.length === 0 && <CarryOver stop={ongoingStop(stops, dayStart)} />}
        <ol className={styles.list} key={day}>
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
