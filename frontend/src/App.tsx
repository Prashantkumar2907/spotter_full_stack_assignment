import { LoadingScreen } from './components/loading/LoadingScreen'
import { PlanScreen } from './components/plan/PlanScreen'
import { EditTripDrawer } from './components/results/EditTripDrawer'
import { PrintSheets } from './components/results/PrintSheets'
import { ResultsScreen } from './components/results/ResultsScreen'
import { useTripFlow } from './hooks/useTripFlow'

export default function App() {
  const flow = useTripFlow()
  const { plan, form, status, error } = flow
  return (
    <>
      <div className="app-root">
        {flow.showingResults && plan ? (
          <>
            <ResultsScreen key={flow.resultsKey} plan={plan} onEdit={flow.openEditor} onNewTrip={flow.startOver} />
            <EditTripDrawer open={flow.editing} form={form} error={error} onClose={flow.closeEditor} onRetry={flow.retry} />
          </>
        ) : (
          <PlanScreen
            form={form}
            loading={status === 'loading'}
            error={error}
            onRetry={flow.retry}
          />
        )}
        {status === 'loading' && <LoadingScreen />}
      </div>
      {plan && <PrintSheets plan={plan} />}
    </>
  )
}
