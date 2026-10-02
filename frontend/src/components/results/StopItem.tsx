import { ArrowDown } from 'lucide-react'
import { STOP_KIND_LABELS } from '../../constants/duty'
import type { Stop } from '../../types/trip'
import { formatMiles } from '../../utils/format'
import { formatClock, formatDuration } from '../../utils/time'
import { cx } from '../../utils/cx'
import { STOP_ICONS, STOP_TONES } from '../map/stopVisuals'
import styles from './StopItem.module.css'

interface StopItemProps {
  stop: Stop
  selected: boolean
  index: number
  onSelect: (id: number) => void
}

export function StopItem({ stop, selected, index, onSelect }: StopItemProps) {
  const Icon = STOP_ICONS[stop.kind]
  const timeRange =
    stop.duration_minutes > 0
      ? `${formatClock(stop.arrive)} – ${formatClock(stop.depart)}`
      : formatClock(stop.arrive)
  return (
    <li className={styles.item} style={{ ['--i' as string]: index }}>
      <button
        type="button"
        className={cx(styles.button, selected && styles.selected)}
        aria-current={selected || undefined}
        onClick={() => onSelect(stop.id)}
      >
        <span className={cx(styles.bubble, styles[STOP_TONES[stop.kind]])}>
          <Icon size={18} strokeWidth={2.3} aria-hidden="true" />
        </span>
        <span className={styles.body}>
          <span className={styles.title}>{STOP_KIND_LABELS[stop.kind]}</span>
          <span className={styles.location}>{stop.location}</span>
          <span className={styles.meta}>
            {timeRange}
            {stop.duration_minutes > 0 && ` · ${formatDuration(stop.duration_minutes)}`}
          </span>
        </span>
        <span className={styles.mile}>{formatMiles(stop.mile)}</span>
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
    <li className={styles.drive} style={{ ['--i' as string]: index }} aria-label="Driving leg">
      <ArrowDown size={14} aria-hidden="true" />
      Drive {formatDuration(minutes)} · {formatMiles(miles)}
    </li>
  )
}
