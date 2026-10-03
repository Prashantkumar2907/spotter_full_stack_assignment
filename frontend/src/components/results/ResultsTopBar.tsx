import { ChevronRight, FileText, Map, Pencil, Plus } from 'lucide-react'
import { Fragment, type CSSProperties } from 'react'
import type { StopKind, TripPlan, WaypointRole } from '../../types/trip'
import { routeStops } from '../../utils/duty'
import { formatDateTime } from '../../utils/time'
import { BrandMark } from '../layout/Brand'
import { ColorSchemeToggle } from '../layout/ColorSchemeToggle'
import { stopTone } from '../map/stopVisuals'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { Tabs } from '../ui/Tabs'
import styles from './ResultsTopBar.module.css'

export type ResultsView = 'overview' | 'logs'

export const RESULTS_TABS_PREFIX = 'results'

const ROLE_KIND: Record<WaypointRole, StopKind> = { current: 'start', pickup: 'pickup', dropoff: 'dropoff' }

interface ResultsTopBarProps {
  plan: TripPlan
  view: ResultsView
  onViewChange: (view: ResultsView) => void
  onEdit: () => void
  onNewTrip: () => void
}

function TripTitle({ plan }: { plan: TripPlan }) {
  return (
    <div className={styles.trip}>
      <h1 className={styles.title}>
        {routeStops(plan.route.waypoints).map(({ label, role }, index) => (
          <Fragment key={`${label}-${index}`}>
            {index > 0 && <ChevronRight size={16} className={styles.arrow} aria-label="to" />}
            <span className={styles.place} style={{ '--tone': stopTone(ROLE_KIND[role]) } as CSSProperties}>
              {label}
            </span>
          </Fragment>
        ))}
      </h1>
      <p className={styles.meta}>
        {formatDateTime(plan.summary.start)} – {formatDateTime(plan.summary.end)}
      </p>
    </div>
  )
}

export function ResultsTopBar({ plan, view, onViewChange, onEdit, onNewTrip }: ResultsTopBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.lead}>
        <BrandMark className={styles.mark} />
        <TripTitle plan={plan} />
      </div>
      <Tabs
        label="Trip views"
        idPrefix={RESULTS_TABS_PREFIX}
        value={view}
        onChange={(id) => onViewChange(id as ResultsView)}
        items={[
          { id: 'overview', label: 'Route', icon: Map },
          { id: 'logs', label: `Daily logs · ${plan.logs.length}`, icon: FileText },
        ]}
      />
      <div className={styles.actions}>
        <IconButton icon={Pencil} label="Edit trip" variant="outline" onClick={onEdit} />
        <Button size="sm" icon={Plus} onClick={onNewTrip} className={styles.newTrip}>
          New trip
        </Button>
        <span className={styles.divider} aria-hidden="true" />
        <ColorSchemeToggle tooltip="left" />
      </div>
    </header>
  )
}
