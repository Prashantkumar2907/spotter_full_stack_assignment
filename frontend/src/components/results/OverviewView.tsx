import { Suspense, lazy, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { TripPlan } from '../../types/trip'
import type { FitPadding } from '../map/mapEffects'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { Skeleton } from '../ui/Skeleton'
import { Itinerary } from './Itinerary'
import { TripStats } from './TripStats'
import styles from './OverviewView.module.css'

const RouteMap = lazy(() => import('../map/RouteMap'))

const FLOATING_PADDING: FitPadding = { topLeft: [56, 190], bottomRight: [440, 80] }
const STACKED_PADDING: FitPadding = { topLeft: [32, 32], bottomRight: [32, 32] }

function useSelectedStop(plan: TripPlan) {
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)
  const [trackedPlan, setTrackedPlan] = useState(plan)
  if (plan !== trackedPlan) {
    setTrackedPlan(plan)
    setSelectedStopId(null)
  }
  return [selectedStopId, setSelectedStopId] as const
}

export function OverviewView({ plan }: { plan: TripPlan }) {
  const [selectedStopId, setSelectedStopId] = useSelectedStop(plan)
  const floating = useMediaQuery('(min-width: 1100px)')
  const mapError = <p className={styles.mapError}>The map could not be shown. The itinerary and log sheets are still available.</p>
  return (
    <div className={styles.overview}>
      <div className={styles.map} aria-label="Route map" role="region">
        <ErrorBoundary fallback={mapError}>
          <Suspense fallback={<Skeleton className={styles.mapFallback} />}>
            <RouteMap
              plan={plan}
              selectedStopId={selectedStopId}
              onSelectStop={setSelectedStopId}
              padding={floating ? FLOATING_PADDING : STACKED_PADDING}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
      <TripStats plan={plan} className={styles.stats} />
      <Itinerary
        key={plan.summary.start + plan.summary.end}
        stops={plan.stops}
        logs={plan.logs}
        selectedStopId={selectedStopId}
        onSelectStop={setSelectedStopId}
        className={styles.itinerary}
      />
    </div>
  )
}
