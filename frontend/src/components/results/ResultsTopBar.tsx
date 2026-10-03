import { ArrowRight, FileText, Map, Pencil, Plus } from 'lucide-react'
import { Fragment } from 'react'
import type { TripPlan } from '../../types/trip'
import { routeTitleParts } from '../../utils/duty'
import { formatDateTime } from '../../utils/time'
import { BrandMark } from '../layout/Brand'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import styles from './ResultsTopBar.module.css'

export type ResultsView = 'overview' | 'logs'

export const RESULTS_TABS_PREFIX = 'results'

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
        {routeTitleParts(plan.route.waypoints).map((part, index) => (
          <Fragment key={`${part}-${index}`}>
            {index > 0 && <ArrowRight size={16} className={styles.arrow} aria-label="to" />}
            <span className={styles.place}>{part}</span>
          </Fragment>
        ))}
      </h1>
      <p className={styles.meta}>
        {formatDateTime(plan.summary.start)} → {formatDateTime(plan.summary.end)}
      </p>
    </div>
  )
}

export function ResultsTopBar({ plan, view, onViewChange, onEdit, onNewTrip }: ResultsTopBarProps) {
  return (
    <header className={`ink ${styles.bar}`}>
      <BrandMark className={styles.mark} />
      <TripTitle plan={plan} />
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
        <Button variant="secondary" size="sm" icon={Pencil} onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" icon={Plus} onClick={onNewTrip}>
          New trip
        </Button>
      </div>
    </header>
  )
}
