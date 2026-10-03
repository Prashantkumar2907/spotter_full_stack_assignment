import type { CSSProperties } from 'react'
import { TruckShapes } from '../layout/Truck'
import { TRUCK_TOP_HEIGHT, TRUCK_TOP_SHAPES, TRUCK_TOP_WIDTH } from '../layout/truckArt'
import {
  CARGO_FILL,
  CARGO_WIDTH,
  DEPART,
  LOOP,
  PIN_CARD,
  PROGRESS_WIDTH,
  TRUCK_MOTION,
  doneTimes,
  pinCardX,
  progressTimes,
  pulseTimes,
  type Motion,
  type Pin,
} from './illustrationTimeline'
import styles from './RouteIllustration.module.css'

const TRUCK_SCALE = 0.72
const TRUCK_TRANSFORM = `scale(${TRUCK_SCALE}) translate(${-TRUCK_TOP_WIDTH / 2} ${-TRUCK_TOP_HEIGHT / 2})`
const STATIC_TRUCK = 'translate(143 235) rotate(152)'
const PIN_RADIUS = 13
const PULSE_RADIUS = 30
const ICON_SIZE = 14
const CHECK_RADIUS = 7

const [TRAILER, ...TRUCK_BODY] = TRUCK_TOP_SHAPES.filter((shape) => shape.part !== 'cargo')
const CARGO = TRUCK_TOP_SHAPES.find((shape) => shape.part === 'cargo')?.attrs ?? {}

export function Road({ id, path, tone }: { id?: string; path: string; tone: 'local' | 'highway' }) {
  return (
    <g className={styles[tone]}>
      <path d={path} className={styles.casing} />
      <path id={id} d={path} className={styles.asphalt} />
      <path d={path} className={styles.lane} />
    </g>
  )
}

export function Trail({ path, motion, animated, kind }: { path: string; motion: Motion; animated: boolean; kind: 'empty' | 'loaded' }) {
  return (
    <path d={path} pathLength={1} className={styles[`${kind}Trail`]} strokeDashoffset={animated ? 1 : 0}>
      {animated && (
        <animate attributeName="stroke-dashoffset" calcMode="spline" {...motion} dur={LOOP} repeatCount="indefinite" />
      )}
    </path>
  )
}

export function TravelingTruck({ pathId, animated }: { pathId: string; animated: boolean }) {
  return (
    <g className={styles.truck} transform={animated ? undefined : STATIC_TRUCK}>
      <g transform={TRUCK_TRANSFORM}>
        <TruckShapes shapes={[TRAILER]} />
        <rect {...CARGO} width={animated ? 0 : CARGO_WIDTH} className="truck-cargo">
          {animated && <animate attributeName="width" {...CARGO_FILL} dur={LOOP} repeatCount="indefinite" />}
        </rect>
        <TruckShapes shapes={TRUCK_BODY} />
      </g>
      {animated && (
        <animateMotion
          dur={LOOP}
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes={TRUCK_MOTION.keyTimes}
          keyPoints={TRUCK_MOTION.values}
          keySplines={TRUCK_MOTION.keySplines}
          rotate="auto"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
      )}
    </g>
  )
}

function CardProgress({ pin, x, animated }: { pin: Pin; x: number; animated: boolean }) {
  const y = PIN_CARD.height / 2 - 9
  return (
    <>
      <rect x={x + PIN_CARD.inset} y={y} width={PROGRESS_WIDTH} height="3" rx="1.5" className={styles.progressTrack} />
      <rect x={x + PIN_CARD.inset} y={y} width={animated ? 0 : PROGRESS_WIDTH} height="3" rx="1.5" className={styles.progressFill}>
        {animated && (
          <animate attributeName="width" values={`0;0;${PROGRESS_WIDTH};${PROGRESS_WIDTH};0`} keyTimes={progressTimes(pin)} dur={LOOP} repeatCount="indefinite" />
        )}
      </rect>
    </>
  )
}

function DoneCheck({ pin, x, animated }: { pin: Pin; x: number; animated: boolean }) {
  const cx = x + PIN_CARD.width - PIN_CARD.inset - CHECK_RADIUS / 2
  const cy = -PIN_CARD.height / 2 + PIN_CARD.inset + 2
  return (
    <g opacity={animated ? 0 : 1}>
      {animated && <animate attributeName="opacity" values="0;1;1;0" keyTimes={doneTimes(pin)} calcMode="discrete" dur={LOOP} repeatCount="indefinite" />}
      <circle cx={cx} cy={cy} r={CHECK_RADIUS} className={styles.check} />
      <path d={`M${cx - 3} ${cy}l2 2 4-4`} className={styles.checkMark} />
    </g>
  )
}

function PinCard({ pin, animated }: { pin: Pin; animated: boolean }) {
  const x = pinCardX(pin)
  return (
    <g>
      <rect x={x} y={-PIN_CARD.height / 2} width={PIN_CARD.width} height={PIN_CARD.height} rx="11" className={styles.cardBox} />
      <text x={x + PIN_CARD.inset} y={-5} className={styles.cardTitle}>
        {pin.label}
      </text>
      <text x={x + PIN_CARD.inset} y={9} className={styles.cardNote}>
        {pin.note}
      </text>
      <CardProgress pin={pin} x={x} animated={animated} />
      <DoneCheck pin={pin} x={x} animated={animated} />
    </g>
  )
}

function Pulse({ arrival }: { arrival: number }) {
  return (
    <circle r={PIN_RADIUS} className={styles.pulse}>
      <animate attributeName="r" values={`${PIN_RADIUS};${PIN_RADIUS};${PIN_RADIUS};${PULSE_RADIUS};${PULSE_RADIUS}`} keyTimes={pulseTimes(arrival)} dur={LOOP} repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;0;0.9;0;0" keyTimes={pulseTimes(arrival)} dur={LOOP} repeatCount="indefinite" />
    </circle>
  )
}

export function PinMark({ pin, animated }: { pin: Pin; animated: boolean }) {
  const Icon = pin.icon
  return (
    <g transform={`translate(${pin.x} ${pin.y})`} style={{ '--pin-tone': pin.tone } as CSSProperties}>
      <PinCard pin={pin} animated={animated} />
      {animated && pin.arrival > DEPART && <Pulse arrival={pin.arrival} />}
      <circle r={PIN_RADIUS + 4} className={styles.pinHalo} />
      <circle r={PIN_RADIUS} className={styles.pin} />
      <Icon x={-ICON_SIZE / 2} y={-ICON_SIZE / 2} size={ICON_SIZE} strokeWidth={2.5} color="var(--pin-glyph)" aria-hidden="true" />
    </g>
  )
}
