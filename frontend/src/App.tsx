import { useCallback, useState } from 'react'
import { LoadingScreen } from './components/loading/LoadingScreen'
import { PlanScreen } from './components/plan/PlanScreen'
import { PrintSheets } from './components/results/PrintSheets'
import { ResultsScreen } from './components/results/ResultsScreen'
import { useTripForm } from './hooks/useTripForm'
import { useTripPlanner } from './hooks/useTripPlanner'
import type { TripRequestPayload } from './types/trip'
import { withViewTransition } from './utils/viewTransition'

type Screen = 'plan' | 'results'

export default function App() {
  const { status, plan, error, submit } = useTripPlanner()
  const [screen, setScreen] = useState<Screen>('plan')

  const planAndShow = useCallback(
    async (payload: TripRequestPayload) => {
      const result = await submit(payload)
      if (result) withViewTransition(() => setScreen('results'))
    },
    [submit],
  )
  const form = useTripForm((payload) => void planAndShow(payload))
  const showPlan = () => withViewTransition(() => setScreen('plan'))
  const startOver = () => {
    form.reset()
    showPlan()
  }

  return (
    <>
      <div className="app-root">
        {screen === 'results' && plan ? (
          <ResultsScreen plan={plan} onEdit={showPlan} onNewTrip={startOver} />
        ) : (
          <PlanScreen
            form={form}
            loading={status === 'loading'}
            error={error}
            onBackToResults={plan ? () => withViewTransition(() => setScreen('results')) : undefined}
          />
        )}
        {status === 'loading' && <LoadingScreen />}
      </div>
      {plan && <PrintSheets plan={plan} />}
    </>
  )
}
