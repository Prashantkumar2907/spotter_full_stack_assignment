import { useState } from 'react'
import type { TripPlan } from '../../types/trip'
import { tabButtonId, tabPanelId } from '../ui/tabIds'
import { LogsView } from './LogsView'
import { OverviewView } from './OverviewView'
import { RESULTS_TABS_PREFIX, ResultsTopBar, type ResultsView } from './ResultsTopBar'
import styles from './ResultsScreen.module.css'

interface ResultsScreenProps {
  plan: TripPlan
  onEdit: () => void
  onNewTrip: () => void
}

export function ResultsScreen({ plan, onEdit, onNewTrip }: ResultsScreenProps) {
  const [view, setView] = useState<ResultsView>('overview')
  return (
    <div className={styles.screen}>
      <ResultsTopBar plan={plan} view={view} onViewChange={setView} onEdit={onEdit} onNewTrip={onNewTrip} />
      <main
        className={styles.stage}
        role="tabpanel"
        id={tabPanelId(RESULTS_TABS_PREFIX)}
        aria-labelledby={tabButtonId(RESULTS_TABS_PREFIX, view)}
      >
        <div className={styles.pane} hidden={view !== 'overview'}>
          <OverviewView plan={plan} />
        </div>
        {view === 'logs' && (
          <div className={styles.pane}>
            <LogsView plan={plan} />
          </div>
        )}
      </main>
    </div>
  )
}
