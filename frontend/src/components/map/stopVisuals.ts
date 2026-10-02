import {
  Coffee,
  Flag,
  Fuel,
  LocateFixed,
  type LucideIcon,
  MoonStar,
  PackageOpen,
  RotateCcw,
} from 'lucide-react'
import type { StopKind } from '../../types/trip'

export const STOP_ICONS: Record<StopKind, LucideIcon> = {
  start: LocateFixed,
  pickup: PackageOpen,
  dropoff: Flag,
  fuel: Fuel,
  break: Coffee,
  rest: MoonStar,
  restart: RotateCcw,
}

export const STOP_TONES: Record<StopKind, string> = {
  start: 'slate',
  pickup: 'accent',
  dropoff: 'accent',
  fuel: 'amber',
  break: 'slate',
  rest: 'blue',
  restart: 'blue',
}
