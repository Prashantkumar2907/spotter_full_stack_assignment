import { Suspense, lazy, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useLiveStop, useTripReplay, type TripReplay } from '../../hooks/useTripReplay'
import type { TripPlan } from '../../types/trip'
import type { FitPadding } from '../map/mapEffects'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { Panel } from '../ui/Panel'
import { Skeleton } from '../ui/Skeleton'
import { Itinerary } from './Itinerary'
import { ReplayPanel } from './ReplayPanel'
import { TripStats } from './TripStats'
import styles from './OverviewView.module.css'

const RouteMap = lazy(() => import('../map/RouteMap'))

const FLOATING_PADDING: FitPadding = { topLeft: [48, 150], bottomRight: [440, 88] }
const STACKED_PADDING: FitPadding = { topLeft: [24, 130], bottomRight: [24, 24] }

type StopSelection = readonly [number | null, (id: number | null) => void]

function useSelectedStop(plan: TripPlan): StopSelection {
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)
  const [trackedPlan, setTrackedPlan] = useState(plan)
  if (plan !== trackedPlan) {
    setTrackedPlan(plan)
    setSelectedStopId(null)
  }
  return [selectedStopId, setSelectedStopId] as const
}

function MapRegion({ plan, trip, selection }: { plan: TripPlan; trip: TripReplay; selection: StopSelection }) {
  const floating = useMediaQuery('(min-width: 1100px)')
  const mapError = <p className={styles.mapError}>The map could not be shown. The itinerary and log sheets are still available.</p>
  return (
    <div className={styles.map} aria-label="Route map" role="region">
      <ErrorBoundary fallback={mapError}>
        <Suspense fallback={<Skeleton className={styles.mapFallback} />}>
          <RouteMap
            plan={plan}
            trip={trip}
            selectedStopId={selection[0]}
            onSelectStop={selection[1]}
            padding={floating ? FLOATING_PADDING : STACKED_PADDING}
          />
        </Suspense>
      </ErrorBoundary>
      <ReplayPanel trip={trip} logs={plan.logs} className={styles.replay} />
    </div>
  )
}

function TripPanel({ plan, trip, selection }: { plan: TripPlan; trip: TripReplay; selection: StopSelection }) {
  const liveStop = useLiveStop(trip)
  return (
    <Panel as="aside" className={styles.panel} aria-label="Trip details">
      <TripStats plan={plan} />
      <Itinerary
        key={plan.summary.start + plan.summary.end}
        stops={plan.stops}
        logs={plan.logs}
        selectedStopId={selection[0]}
        onSelectStop={selection[1]}
        liveStop={liveStop}
        className={styles.itinerary}
      />
    </Panel>
  )
}

export function OverviewView({ plan }: { plan: TripPlan }) {
  const selection = useSelectedStop(plan)
  const trip = useTripReplay(plan)
  return (
    <div className={styles.overview}>
      <MapRegion plan={plan} trip={trip} selection={selection} />
      <TripPanel plan={plan} trip={trip} selection={selection} />
    </div>
  )
}
