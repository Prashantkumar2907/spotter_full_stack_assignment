import { useId, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { PinMark, Road, Trail, TravelingTruck } from './IllustrationParts'
import {
  BLOCKS,
  DUTY_BADGES,
  DUTY_OFFSETS,
  DUTY_PATH,
  DUTY_PEN_POINTS,
  DUTY_ROWS,
  EMPTY_TRAIL,
  FADE_TIMES,
  GRID_ROW,
  GRID_TOP,
  GRID_WIDTH,
  GRID_X,
  HOURS_PER_DAY,
  KEY_TIMES,
  LEG_LOADED,
  LEG_TO_PICKUP,
  LOADED_TRAIL,
  LOG_CARD,
  LOOP,
  PINS,
  ROUTE_PATH,
  STATUS_TIMES,
  VIEWBOX,
  type DutyBadge,
} from './illustrationTimeline'
import styles from './RouteIllustration.module.css'

const BADGE = { width: 62, height: 18 }
const HOUR_TICKS = Array.from({ length: HOURS_PER_DAY + 1 }, (_, hour) => GRID_X + (hour / HOURS_PER_DAY) * GRID_WIDTH)
  .map((x, hour) => `M${x.toFixed(2)} ${GRID_TOP}v${hour % 6 === 0 ? -6 : -3}`)
  .join('')

function StatusBadge({ badge, animated, fallback }: { badge: DutyBadge; animated: boolean; fallback: boolean }) {
  const x = LOG_CARD.x + LOG_CARD.width - BADGE.width - 12
  const y = LOG_CARD.y + 10
  return (
    <g opacity={animated || fallback ? 1 : 0} style={{ color: badge.tone }}>
      {animated && <animate attributeName="opacity" values={badge.visible} keyTimes={STATUS_TIMES} calcMode="discrete" dur={LOOP} repeatCount="indefinite" />}
      <rect x={x} y={y} width={BADGE.width} height={BADGE.height} rx={BADGE.height / 2} className={styles.badge} />
      <circle cx={x + 10} cy={y + BADGE.height / 2} r="3" fill="currentColor" />
      <text x={x + 17} y={y + 12.5} className={styles.badgeText}>
        {badge.label}
      </text>
    </g>
  )
}

function DutyLine({ penPathId, animated }: { penPathId: string; animated: boolean }) {
  return (
    <>
      <path id={penPathId} d={DUTY_PATH} fill="none" stroke="none" />
      <path d={DUTY_PATH} pathLength={1} className={styles.duty} strokeDashoffset={animated ? 1 : 0}>
        {animated && <animate attributeName="stroke-dashoffset" values={DUTY_OFFSETS} keyTimes={KEY_TIMES} dur={LOOP} repeatCount="indefinite" />}
      </path>
      {animated && (
        <circle r="3" className={styles.pen}>
          <animateMotion dur={LOOP} repeatCount="indefinite" calcMode="linear" keyTimes={KEY_TIMES} keyPoints={DUTY_PEN_POINTS}>
            <mpath href={`#${penPathId}`} />
          </animateMotion>
        </circle>
      )}
    </>
  )
}

function LogCard({ penPathId, animated }: { penPathId: string; animated: boolean }) {
  return (
    <g>
      <rect {...LOG_CARD} rx="14" className={styles.cardBox} />
      <text x={LOG_CARD.x + 14} y={LOG_CARD.y + 23} className={styles.cardTitle}>
        Daily log
      </text>
      {DUTY_BADGES.map((badge, index) => (
        <StatusBadge key={badge.label} badge={badge} animated={animated} fallback={index === 1} />
      ))}
      <path d={HOUR_TICKS} className={styles.ticks} />
      {DUTY_ROWS.map((row, index) => (
        <g key={row}>
          <rect x={GRID_X} y={GRID_TOP + index * GRID_ROW} width={GRID_WIDTH} height={GRID_ROW} className={styles.gridRow} />
          <text x={LOG_CARD.x + 14} y={GRID_TOP + index * GRID_ROW + GRID_ROW / 2 + 3} className={styles.rowLabel}>
            {row}
          </text>
        </g>
      ))}
      <DutyLine penPathId={penPathId} animated={animated} />
    </g>
  )
}

function FadingLayer({ animated, children }: { animated: boolean; children: ReactNode }) {
  return (
    <g>
      {animated && <animate attributeName="opacity" values="0;1;1;0" keyTimes={FADE_TIMES} dur={LOOP} repeatCount="indefinite" />}
      {children}
    </g>
  )
}

export function RouteIllustration() {
  const animated = !usePrefersReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const routeId = `route-${uid}`
  return (
    <svg className={styles.art} viewBox={VIEWBOX} role="img" aria-label="A truck drives empty to the pickup, loads, drives loaded to the drop-off and unloads, while its daily log line is drawn">
      <path d={BLOCKS} className={styles.blocks} />
      <path id={routeId} d={ROUTE_PATH} fill="none" stroke="none" />
      <Road path={LEG_TO_PICKUP} tone="local" />
      <Road path={LEG_LOADED} tone="highway" />
      <FadingLayer animated={animated}>
        <Trail path={LEG_TO_PICKUP} motion={EMPTY_TRAIL} animated={animated} kind="empty" />
        <Trail path={LEG_LOADED} motion={LOADED_TRAIL} animated={animated} kind="loaded" />
      </FadingLayer>
      <LogCard penPathId={`duty-pen-${uid}`} animated={animated} />
      {PINS.map((pin) => (
        <PinMark key={pin.label} pin={pin} animated={animated} />
      ))}
      <FadingLayer animated={animated}>
        <TravelingTruck pathId={routeId} animated={animated} />
      </FadingLayer>
    </svg>
  )
}
