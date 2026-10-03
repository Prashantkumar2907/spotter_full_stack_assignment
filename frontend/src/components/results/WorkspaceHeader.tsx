import { ArrowRight, FileText, Map } from 'lucide-react'
import { Fragment } from 'react'
import type { TripPlan } from '../../types/trip'
import { routeTitleParts } from '../../utils/duty'
import { formatDateTime } from '../../utils/time'
import { Tabs } from '../ui/Tabs'
import styles from './WorkspaceHeader.module.css'

export type WorkspaceView = 'route' | 'logs'

export const WORKSPACE_TABS_PREFIX = 'workspace'

interface WorkspaceHeaderProps {
  plan: TripPlan | null
  view: WorkspaceView
  onViewChange: (view: WorkspaceView) => void
}

function TripTitle({ plan }: { plan: TripPlan }) {
  const parts = routeTitleParts(plan.route.waypoints)
  return (
    <div className={styles.titleBlock}>
      <h2 className={styles.title}>
        {parts.map((part, index) => (
          <Fragment key={`${part}-${index}`}>
            {index > 0 && <ArrowRight size={18} className={styles.arrow} aria-label="to" />}
            <span className={styles.place}>{part}</span>
          </Fragment>
        ))}
      </h2>
      <p className={styles.subtitle}>
        Departs {formatDateTime(plan.summary.start)} · Arrives {formatDateTime(plan.summary.end)}
      </p>
    </div>
  )
}

function Placeholder() {
  return (
    <div className={styles.titleBlock}>
      <h2 className={styles.title}>Trip overview</h2>
      <p className={styles.subtitle}>The route, stops and daily log sheets appear here.</p>
    </div>
  )
}

export function WorkspaceHeader({ plan, view, onViewChange }: WorkspaceHeaderProps) {
  return (
    <header className={styles.header}>
      {plan ? <TripTitle key={plan.summary.start + plan.summary.end} plan={plan} /> : <Placeholder />}
      {plan && (
        <Tabs
          label="Trip views"
          idPrefix={WORKSPACE_TABS_PREFIX}
          variant="pill"
          value={view}
          onChange={(id) => onViewChange(id as WorkspaceView)}
          items={[
            { id: 'route', label: 'Route and stops', icon: Map },
            { id: 'logs', label: `Log sheets (${plan.logs.length})`, icon: FileText },
          ]}
        />
      )}
    </header>
  )
}
