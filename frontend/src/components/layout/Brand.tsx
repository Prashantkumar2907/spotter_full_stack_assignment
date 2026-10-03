import { useId, type CSSProperties } from 'react'
import { TruckShapes } from './Truck'
import styles from './Brand.module.css'

const TILE = 40
const TILE_RADIUS = 11
const TRUCK_SCALE = 0.6
const TRUCK_X = 8.4
const TRUCK_Y = 12.6
const ROAD_Y = 28.6
const LOG_TRACE = 'M4 13.5H9.5V7.5H17V11H21.5V7.5H27'
const SPEED_LINES = 'M2.6 17.4H6M1.6 21.4H5.4M3.4 25.2H6.6'

const MARK_COLORS = {
  '--truck-trailer': '#ffffff',
  '--truck-cab': '#ffffff',
  '--truck-window': '#066a3c',
  '--truck-wheel': '#15181b',
  '--truck-tire': '#ffffff',
  '--truck-hitch': '#cdebdc',
} as CSSProperties

export function BrandMark({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const tileId = `brand-tile-${uid}`
  const clipId = `brand-clip-${uid}`
  return (
    <svg className={className ?? styles.mark} viewBox={`0 0 ${TILE} ${TILE}`} aria-hidden="true">
      <defs>
        <linearGradient id={tileId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#159457" />
          <stop offset="1" stopColor="#065c34" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect width={TILE} height={TILE} rx={TILE_RADIUS} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={TILE} height={TILE} fill={`url(#${tileId})`} />
        <rect y={ROAD_Y} width={TILE} height={TILE - ROAD_Y} fill="#15181b" fillOpacity="0.72" />
        <path className={styles.lane} d={`M0 ${ROAD_Y + 5.4}H${TILE}`} />
      </g>
      <path className={styles.speed} d={SPEED_LINES} />
      <g className={styles.truck} transform={`translate(${TRUCK_X} ${TRUCK_Y}) scale(${TRUCK_SCALE})`} style={MARK_COLORS}>
        <TruckShapes />
        <path className={styles.trace} d={LOG_TRACE} />
      </g>
    </svg>
  )
}

export function Brand() {
  return (
    <div className={styles.brand}>
      <BrandMark />
      <p className={styles.name}>Milemark</p>
    </div>
  )
}
