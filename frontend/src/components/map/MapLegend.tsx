import type { CSSProperties } from 'react'
import { STOP_KIND_LABELS } from '../../constants/duty'
import type { StopKind } from '../../types/trip'
import { STOP_ICONS, stopTone } from './stopVisuals'
import styles from './MapLegend.module.css'

const LEGEND_ORDER: StopKind[] = ['start', 'pickup', 'dropoff', 'fuel', 'break', 'rest', 'restart']

interface MapLegendProps {
  kinds: Set<StopKind>
  showDeadhead: boolean
}

function LineKey({ kind, children }: { kind: 'loaded' | 'deadhead'; children: string }) {
  return (
    <li className={styles.item}>
      <span className={`${styles.line} ${styles[kind]}`} aria-hidden="true" />
      {children}
    </li>
  )
}

export function MapLegend({ kinds, showDeadhead }: MapLegendProps) {
  return (
    <ul className={styles.legend} aria-label="Map legend">
      {showDeadhead && <LineKey kind="deadhead">Empty</LineKey>}
      <LineKey kind="loaded">Loaded</LineKey>
      {LEGEND_ORDER.filter((kind) => kinds.has(kind)).map((kind) => {
        const Icon = STOP_ICONS[kind]
        return (
          <li key={kind} className={styles.item}>
            <span className={styles.swatch} style={{ '--tone': stopTone(kind) } as CSSProperties}>
              <Icon size={12} strokeWidth={2.6} aria-hidden="true" />
            </span>
            {STOP_KIND_LABELS[kind]}
          </li>
        )
      })}
    </ul>
  )
}
