import { Truck } from 'lucide-react'
import type { CSSProperties } from 'react'
import { STOP_KIND_LABELS } from '../../constants/duty'
import type { Stop } from '../../types/trip'
import { cx } from '../../utils/cx'
import { formatMiles } from '../../utils/format'
import { formatClock, formatDuration } from '../../utils/time'
import { STOP_ICONS, stopTone } from '../map/stopVisuals'
import styles from './StopItem.module.css'

interface StopItemProps {
  stop: Stop
  selected: boolean
  index: number
  onSelect: (id: number) => void
}

function stagger(index: number, tone?: string): CSSProperties {
  return { '--i': index, '--tone': tone } as CSSProperties
}

export function StopItem({ stop, selected, index, onSelect }: StopItemProps) {
  const Icon = STOP_ICONS[stop.kind]
  return (
    <li className={styles.item} style={stagger(index, stopTone(stop.kind))}>
      <button
        type="button"
        className={cx(styles.button, selected && styles.selected)}
        aria-current={selected || undefined}
        onClick={() => onSelect(stop.id)}
      >
        <span className={styles.time}>{formatClock(stop.arrive)}</span>
        <span className={styles.node}>
          <Icon size={16} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <span className={styles.body}>
          <span className={styles.title}>{STOP_KIND_LABELS[stop.kind]}</span>
          <span className={styles.location}>{stop.location}</span>
          <span className={styles.meta}>
            {stop.duration_minutes > 0 ? `${formatDuration(stop.duration_minutes)} · ` : ''}
            mile {formatMiles(stop.mile).replace(' mi', '')}
          </span>
        </span>
      </button>
    </li>
  )
}

interface DriveConnectorProps {
  miles: number
  minutes: number
  index: number
}

export function DriveConnector({ miles, minutes, index }: DriveConnectorProps) {
  return (
    <li className={styles.drive} style={stagger(index)}>
      <span className={styles.driveBadge}>
        <Truck size={13} aria-hidden="true" />
        Drive {formatDuration(minutes)} · {formatMiles(miles)}
      </span>
    </li>
  )
}
