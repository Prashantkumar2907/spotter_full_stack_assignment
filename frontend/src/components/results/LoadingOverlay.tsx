import { Spinner } from '../ui/Spinner'
import { Skeleton } from '../ui/Skeleton'
import styles from './LoadingOverlay.module.css'

export function LoadingOverlay() {
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.card}>
        <Spinner size={22} />
        <div>
          <p className={styles.title}>Planning your trip</p>
          <p className={styles.text}>Finding the route and applying hours-of-service rules</p>
        </div>
      </div>
      <Skeleton className={styles.bar} />
    </div>
  )
}
