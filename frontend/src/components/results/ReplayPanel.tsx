import { Slider } from '@mantine/core'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useReplayFrame, type TripReplay } from '../../hooks/useTripReplay'
import type { DailyLog } from '../../types/trip'
import { formatMiles, formatNumber } from '../../utils/format'
import { activityOf } from '../../utils/replayLabels'
import { formatMoment } from '../../utils/time'
import { stopTone } from '../map/stopVisuals'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import styles from './ReplayPanel.module.css'

const SLIDER_STEPS = 1000

function localDate(ms: number): string {
  const date = new Date(ms)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function dayNumber(logs: DailyLog[], ms: number): number {
  return Math.max(1, logs.findIndex((log) => log.date === localDate(ms)) + 1)
}

function ReplayControls({ trip, playing, done }: { trip: TripReplay; playing: boolean; done: boolean }) {
  const { clock } = trip
  if (done) return <IconButton icon={RotateCcw} label="Replay trip" variant="solid" tooltip="top" onClick={clock.play} />
  return playing ? (
    <IconButton icon={Pause} label="Pause replay" variant="solid" tooltip="top" onClick={clock.pause} />
  ) : (
    <IconButton icon={Play} label="Play replay" variant="solid" tooltip="top" onClick={clock.play} />
  )
}

function ReplayProgress({ trip, progress, mile }: { trip: TripReplay; progress: number; mile: number }) {
  const { clock, replay } = trip
  return (
    <div className={styles.progress}>
      <Slider
        className={styles.slider}
        value={Math.round(progress * SLIDER_STEPS)}
        max={SLIDER_STEPS}
        label={null}
        size="sm"
        thumbLabel="Trip replay position"
        onChange={(value) => {
          clock.pause()
          clock.seek((value / SLIDER_STEPS) * clock.totalMs)
        }}
      />
      <span className={styles.miles}>
        {formatNumber(mile)} <span>/ {formatMiles(replay.totalMiles)}</span>
      </span>
    </div>
  )
}

export function ReplayPanel({ trip, logs, className }: { trip: TripReplay; logs: DailyLog[]; className?: string }) {
  const { state, frame } = useReplayFrame(trip)
  const activity = activityOf(frame.phase, frame.done)
  const tone = activity.kind === 'drive' ? 'var(--status-driving)' : stopTone(activity.kind)
  return (
    <section className={`${styles.panel} ${className ?? ''}`} aria-label="Trip replay" style={{ '--tone': tone } as CSSProperties}>
      <div className={styles.row}>
        <ReplayControls trip={trip} playing={state.playing} done={frame.done} />
        <div className={styles.status}>
          <p className={styles.when}>
            Day {dayNumber(logs, frame.clock)} · {formatMoment(frame.clock)}
          </p>
          <p className={styles.activity} aria-live="polite">
            <span className={styles.dot} />
            <strong>{activity.title}</strong> <span>{activity.detail}</span>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={trip.clock.cycleSpeed} aria-label={`Replay speed ${state.speed}x`} className={styles.speed}>
          {state.speed}×
        </Button>
      </div>
      <ReplayProgress trip={trip} progress={frame.progress} mile={frame.mile} />
    </section>
  )
}
