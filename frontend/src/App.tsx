
import styles from './App.module.css'
import { AppHeader } from './components/layout/AppHeader'
import { PrintSheets } from './components/results/PrintSheets'
import { Workspace } from './components/results/Workspace'
import { TripForm } from './components/trip-form/TripForm'
import { useTripForm } from './hooks/useTripForm'
import { useTripPlanner } from './hooks/useTripPlanner'

export default function App() {
  const { status, plan, error, submit } = useTripPlanner()
  const form = useTripForm(submit)

  return (
    <>
      <div className={`app-root ${styles.app}`}>
        <AppHeader loading={status === 'loading'} />
        <main className={styles.main}>
          <TripForm form={form} loading={status === 'loading'} />
          <Workspace
            status={status}
            plan={plan}
            error={error}
            onSample={form.loadExample}
          />
        </main>
      </div>
      {plan && <PrintSheets plan={plan} />}
    </>
  )
}
