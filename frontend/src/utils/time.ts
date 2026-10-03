import { MINUTES_PER_DAY, MINUTES_PER_HOUR } from '../constants/duty'

const MINUTES_PER_QUARTER = 15
const NOON_HOUR = 12

const clockFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})
const longDayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export function parseNaiveIso(iso: string): Date {
  return new Date(iso)
}

export function formatClock(iso: string): string {
  return clockFormat.format(parseNaiveIso(iso))
}

export function formatDay(iso: string): string {
  return dayFormat.format(parseNaiveIso(iso))
}

export function formatLongDay(iso: string): string {
  return longDayFormat.format(parseNaiveIso(iso))
}

export function formatMoment(ms: number): string {
  const date = new Date(ms)
  return `${dayFormat.format(date)} · ${clockFormat.format(date)}`
}

export function formatDateTime(iso: string): string {
  return `${formatDay(iso)}, ${formatClock(iso)}`
}

export function formatMinuteOfDay(minute: number): string {
  const wrapped = minute % MINUTES_PER_DAY
  const hour24 = Math.floor(wrapped / MINUTES_PER_HOUR)
  const minutes = wrapped % MINUTES_PER_HOUR
  const hour12 = hour24 % NOON_HOUR === 0 ? NOON_HOUR : hour24 % NOON_HOUR
  const suffix = hour24 < NOON_HOUR ? 'AM' : 'PM'
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
  const minutes = Math.round(totalMinutes % MINUTES_PER_HOUR)
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}

export function formatElapsed(totalMinutes: number): string {
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY)
  if (days === 0) return formatDuration(totalMinutes)
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR)
  return hours === 0 ? `${days} d` : `${days} d ${hours} h`
}

export function formatHours(hours: number): string {
  return hours.toFixed(2)
}

export interface DateParts {
  month: string
  day: string
  year: string
}

export function splitDate(isoDate: string): DateParts {
  const [year, month, day] = isoDate.split('-')
  return { month, day, year }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function toDateTimeLocal(date: Date): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function nextQuarterHour(now: Date = new Date()): string {
  const rounded = new Date(now)
  rounded.setSeconds(0, 0)
  const remainder = rounded.getMinutes() % MINUTES_PER_QUARTER
  rounded.setMinutes(rounded.getMinutes() + (MINUTES_PER_QUARTER - remainder))
  return toDateTimeLocal(rounded)
}

export function nextOccurrenceOfHour(hour: number, now: Date = new Date()): string {
  const target = new Date(now)
  target.setHours(hour, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return toDateTimeLocal(target)
}
