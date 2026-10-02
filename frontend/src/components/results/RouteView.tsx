import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import type { TripPlan } from '../../types/trip'
import { Panel } from '../ui/Panel'
import { Skeleton } from '../ui/Skeleton'
import { Itinerary } from './Itinerary'
import { SummaryStrip } from './SummaryStrip'
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
      {plan && <SummaryStrip summary={plan.summary} />}
      <div className={plan ? styles.split : styles.single}>
        <Panel className={styles.mapPanel} aria-label="Route map">
          <Suspense fallback={<Skeleton className={styles.mapFallback} />}>
            <RouteMap plan={plan} selectedStopId={selectedStopId} onSelectStop={onSelectStop} />
          </Suspense>
          {overlay}
        </Panel>
        {plan && (
          <Itinerary
            key={plan.summary.start + plan.summary.end}
            stops={plan.stops}
            selectedStopId={selectedStopId}
            onSelectStop={onSelectStop}
          />
        )}
      </div>
    </div>
  )
}
