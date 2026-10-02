import { STOP_KIND_LABELS } from '../../constants/duty'
import type { StopKind } from '../../types/trip'
import { STOP_ICONS, STOP_TONES } from './stopVisuals'
import styles from './MapLegend.module.css'

const LEGEND_KINDS: StopKind[] = ['pickup', 'dropoff', 'fuel', 'break', 'rest', 'restart']

function LineKey({ kind, children }: { kind: 'loaded' | 'deadhead'; children: string }) {
  return (
    <li className={styles.item}>
      <span className={`${styles.line} ${styles[kind]}`} aria-hidden="true" />
      {children}
    </li>
  )
}

export function MapLegend() {
  return (
    <ul className={styles.legend} aria-label="Map legend">
      <LineKey kind="deadhead">To pickup</LineKey>
      <LineKey kind="loaded">To drop-off</LineKey>
      {LEGEND_KINDS.map((kind) => {
        const Icon = STOP_ICONS[kind]
        return (
          <li key={kind} className={styles.item}>
            <span className={`${styles.swatch} ${styles[STOP_TONES[kind]]}`}>
              <Icon size={12} strokeWidth={2.6} aria-hidden="true" />
            </span>
            {STOP_KIND_LABELS[kind]}
          </li>
        )
      })}
    </ul>
  )
}
