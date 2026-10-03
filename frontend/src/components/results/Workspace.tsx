import { useState } from 'react'
import type { ApiError } from '../../api/client'
import { TRIP_EXAMPLES, type TripExample } from '../../constants/examples'
import type { PlannerStatus } from '../../hooks/useTripPlanner'
import type { TripPlan } from '../../types/trip'
import { Alert } from '../ui/Alert'
import { tabButtonId, tabPanelId } from '../ui/tabIds'
import { EmptyOverlay } from './EmptyOverlay'
import { LoadingOverlay } from './LoadingOverlay'
import { LogsView } from './LogsView'
import { RouteView } from './RouteView'
import { WORKSPACE_TABS_PREFIX, WorkspaceHeader, type WorkspaceView } from './WorkspaceHeader'
import styles from './Workspace.module.css'

interface WorkspaceProps {
  status: PlannerStatus
  plan: TripPlan | null
  error: ApiError | null
  onSample: (example: TripExample) => void
}

function useSelectedStop(plan: TripPlan | null) {
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)
  const [trackedPlan, setTrackedPlan] = useState(plan)
  if (plan !== trackedPlan) {
    setTrackedPlan(plan)
    setSelectedStopId(null)
  }
  return [selectedStopId, setSelectedStopId] as const
}

function StageOverlay({ status, plan, onSample }: Omit<WorkspaceProps, 'error'>) {
  if (plan) return null
  if (status === 'loading') return <LoadingOverlay />
  return <EmptyOverlay onTrySample={() => onSample(TRIP_EXAMPLES[0])} />
}

export function Workspace({ status, plan, error, onSample }: WorkspaceProps) {
  const [view, setView] = useState<WorkspaceView>('route')
  const [selectedStopId, setSelectedStopId] = useSelectedStop(plan)
  return (
    <div className={styles.workspace}>
      {status === 'loading' && <div className={styles.progress} role="progressbar" aria-label="Planning trip" />}
      <WorkspaceHeader plan={plan} view={view} onViewChange={setView} />
      {error && <Alert title="Could not plan this trip">{error.message}</Alert>}
      <div
        className={styles.stage}
        role={plan ? 'tabpanel' : undefined}
        id={tabPanelId(WORKSPACE_TABS_PREFIX)}
        aria-labelledby={plan ? tabButtonId(WORKSPACE_TABS_PREFIX, view) : undefined}
      >
        <div className={styles.pane} hidden={view !== 'route'}>
          <RouteView
            plan={plan}
            selectedStopId={selectedStopId}
            onSelectStop={setSelectedStopId}
            overlay={<StageOverlay status={status} plan={plan} onSample={onSample} />}
          />
        </div>
        {plan && view === 'logs' && (
          <div className={styles.pane}>
            <LogsView plan={plan} />
          </div>
        )}
      </div>
    </div>
  )
}
