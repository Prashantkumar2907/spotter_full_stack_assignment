import { useId } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import {
  DUTY_OFFSETS,
  DUTY_PATH,
  DUTY_ROWS,
  FADE_TIMES,
  GRID_ROW,
  GRID_TOP,
  KEY_TIMES,
  LOOP,
  PINS,
  PUCK_KEY_POINTS,
  ROUTE_PATH,
  TRAIL_OFFSETS,
  pulseTimes,
} from './illustrationTimeline'
import styles from './RouteIllustration.module.css'

function Puck({ routeId, animated }: { routeId: string; animated: boolean }) {
  return (
    <g transform={animated ? undefined : 'translate(380 58)'}>
      <circle r="13" className={styles.halo}>
        {animated && <animate attributeName="r" values="9;15;9" dur="1.6s" repeatCount="indefinite" />}
      </circle>
      <circle r="8" className={styles.puck} />
      <path d="M-2.6 -3.6 L3.6 0 L-2.6 3.6 Z" className={styles.arrow} />
      {animated && (
        <animateMotion dur={LOOP} repeatCount="indefinite" calcMode="linear" keyTimes={KEY_TIMES} keyPoints={PUCK_KEY_POINTS} rotate="auto">
          <mpath href={`#${routeId}`} />
        </animateMotion>
      )}
    </g>
  )
}

function Pins({ animated }: { animated: boolean }) {
  return (
    <g>
      {PINS.map((pin) => (
        <g key={pin.label}>
          {animated && pin.arrival !== null && (
            <circle cx={pin.x} cy={pin.y} r="7" fill="none" stroke={pin.tone} strokeWidth="2">
              <animate attributeName="r" values="7;7;7;20;20" keyTimes={pulseTimes(pin.arrival)} dur={LOOP} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.8;0;0" keyTimes={pulseTimes(pin.arrival)} dur={LOOP} repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={pin.x} cy={pin.y} r="6" fill={pin.tone} className={styles.pin} />
          <text x={pin.x} y={pin.y - 16} textAnchor="middle" className={styles.pinLabel}>
            {pin.label}
          </text>
        </g>
      ))}
    </g>
  )
}

function DutyGrid() {
  return (
    <g>
      {DUTY_ROWS.map((row, index) => (
        <g key={row}>
          <rect x="40" y={GRID_TOP + index * GRID_ROW} width="340" height={GRID_ROW} className={styles.gridRow} />
          <text x="32" y={GRID_TOP + index * GRID_ROW + 10} textAnchor="end" className={styles.rowLabel}>
            {row}
          </text>
        </g>
      ))}
    </g>
  )
}

function Progress({ path, offsets, className, animated }: { path: string; offsets: string; className: string; animated: boolean }) {
  return (
    <path d={path} pathLength={1} className={className} strokeDashoffset={animated ? 1 : 0}>
      {animated && <animate attributeName="stroke-dashoffset" values={offsets} keyTimes={KEY_TIMES} dur={LOOP} repeatCount="indefinite" />}
    </path>
  )
}

export function RouteIllustration() {
  const animated = !usePrefersReducedMotion()
  const routeId = `hero-route-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg className={styles.art} viewBox="0 0 420 312" role="img" aria-label="A truck drives from start to pickup to drop-off while its log line is drawn below">
      <path id={routeId} d={ROUTE_PATH} className={styles.road} />
      <DutyGrid />
      <Pins animated={animated} />
      <g>
        {animated && <animate attributeName="opacity" values="0;1;1;0" keyTimes={FADE_TIMES} dur={LOOP} repeatCount="indefinite" />}
        <Progress path={ROUTE_PATH} offsets={TRAIL_OFFSETS} className={styles.trail} animated={animated} />
        <Progress path={DUTY_PATH} offsets={DUTY_OFFSETS} className={styles.duty} animated={animated} />
        <Puck routeId={routeId} animated={animated} />
      </g>
    </svg>
  )
}
