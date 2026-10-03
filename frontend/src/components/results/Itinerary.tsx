import { useMemo, useState } from 'react'
import { STOP_KIND_LABELS } from '../../constants/duty'
import type { DailyLog, Stop } from '../../types/trip'
import { buildDayEntries, listDays, ongoingStop, type ItineraryEntry } from '../../utils/itinerary'
import { formatDateTime } from '../../utils/time'
import { cx } from '../../utils/cx'
import { tabButtonId, tabPanelId } from '../ui/tabIds'
import { ITINERARY_TABS_PREFIX, ItineraryHeader } from './ItineraryHeader'
import { DriveConnector, StopItem } from './StopItem'
import styles from './Itinerary.module.css'

interface ItineraryProps {
  stops: Stop[]
  logs: DailyLog[]
  selectedStopId: number | null
  onSelectStop: (id: number) => void
  liveStop?: Stop | null
  className?: string
}

function useFollowedDay(liveStop: Stop | null) {
  const [day, setDay] = useState(liveStop?.day_number ?? 1)
  const [followed, setFollowed] = useState(liveStop)
  if (liveStop && liveStop !== followed) {
    setFollowed(liveStop)
    if (liveStop.day_number !== followed?.day_number) setDay(liveStop.day_number)
  }
  return [day, setDay] as const
}

function CarryOver({ stop }: { stop: Stop | undefined }) {
  if (!stop) return <p className={styles.carry}>No new stops.</p>
  return (
    <p className={styles.carry}>
      {STOP_KIND_LABELS[stop.kind]} at {stop.location} continues until {formatDateTime(stop.depart)}.
    </p>
  )
}

interface EntryListProps {
  entries: ItineraryEntry[]
  day: number
  selectedStopId: number | null
  liveStopId?: number
  onSelectStop: (id: number) => void
}

function EntryList({ entries, day, selectedStopId, liveStopId, onSelectStop }: EntryListProps) {
  return (
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
            live={entry.stop.id === liveStopId}
            onSelect={onSelectStop}
          />
        ),
      )}
    </ol>
  )
}

export function Itinerary({ stops, logs, selectedStopId, onSelectStop, liveStop = null, className }: ItineraryProps) {
  const days = useMemo(() => listDays(logs.length), [logs.length])
  const [day, setDay] = useFollowedDay(liveStop)
  const entries = useMemo(() => buildDayEntries(stops, day), [stops, day])
  const dayStart = `${logs[day - 1].date}T00:00:00`

  return (
    <section className={cx(styles.itinerary, className)} aria-label="Itinerary">
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
        <EntryList entries={entries} day={day} selectedStopId={selectedStopId} liveStopId={liveStop?.id} onSelectStop={onSelectStop} />
      </div>
    </section>
  )
}
