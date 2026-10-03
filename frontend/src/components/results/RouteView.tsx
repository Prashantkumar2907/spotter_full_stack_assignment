import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import type { TripPlan } from '../../types/trip'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { Panel } from '../ui/Panel'
import { Skeleton } from '../ui/Skeleton'
import { Itinerary } from './Itinerary'
import { TripStats } from './TripStats'
import styles from './RouteView.module.css'

const RouteMap = lazy(() => import('../map/RouteMap'))

interface RouteViewProps {
  plan: TripPlan | null
  selectedStopId: number | null
  onSelectStop: (id: number) => void
  overlay?: ReactNode
}

export function RouteView({ plan, selectedStopId, onSelectStop, overlay }: RouteViewProps) {
  return (
    <div className={styles.view}>
      {plan && <TripStats plan={plan} />}
      <div className={plan ? styles.split : styles.single}>
        <Panel className={styles.mapPanel} aria-label="Route map">
          <ErrorBoundary fallback={<p className={styles.mapError}>The map could not be shown. The itinerary and log sheets are still available.</p>}>
            <Suspense fallback={<Skeleton className={styles.mapFallback} />}>
              <RouteMap plan={plan} selectedStopId={selectedStopId} onSelectStop={onSelectStop} />
            </Suspense>
          </ErrorBoundary>
          {overlay}
        </Panel>
        {plan && (
          <Itinerary
            key={plan.summary.start + plan.summary.end}
            stops={plan.stops}
            logs={plan.logs}
            selectedStopId={selectedStopId}
            onSelectStop={onSelectStop}
          />
        )}
      </div>
    </div>
  )
}
