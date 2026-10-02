export type DutyStatus = 'off_duty' | 'sleeper' | 'driving' | 'on_duty'

export type StopKind = 'start' | 'pickup' | 'dropoff' | 'fuel' | 'break' | 'rest' | 'restart'

export type WaypointRole = 'current' | 'pickup' | 'dropoff'

export interface Place {
  label: string
  lat: number
  lng: number
}

export interface LogDetails {
  driver_name: string
  carrier_name: string
  main_office_address: string
  home_terminal_address: string
  vehicle_numbers: string
  shipping_document: string
  commodity: string
}

export interface TripSummary {
  total_miles: number
  driving_minutes: number
  on_duty_minutes: number
  total_minutes: number
  start: string
  end: string
  days: number
  fuel_stops: number
  breaks: number
  rests: number
  restarts: number
}

export interface Waypoint extends Place {
  role: WaypointRole
}

export interface RouteLeg {
  from_label: string
  to_label: string
  miles: number
  drive_minutes: number
}

export interface RouteGeometry {
  polyline: string
  precision: number
  waypoints: Waypoint[]
  legs: RouteLeg[]
}

export interface Stop {
  id: number
  kind: StopKind
  title: string
  location: string
  lat: number
  lng: number
  mile: number
  arrive: string
  depart: string
  duration_minutes: number
  day_number: number
}

export interface LogSegment {
  status: DutyStatus
  activity: string
  start_minute: number
  end_minute: number
}

export interface LogRemark {
  minute: number
  location: string
  note: string
}

export interface LogRecap {
  on_duty_today: number
  cycle_total: number
  available_tomorrow: number
  last_five_days: number
  restart_taken: boolean
}

export interface DailyLog {
  date: string
  day_number: number
  from_location: string
  to_location: string
  total_miles: number
  totals: Record<DutyStatus, number>
  segments: LogSegment[]
  remarks: LogRemark[]
  recap: LogRecap
  details: LogDetails
}

export interface TripPlan {
  summary: TripSummary
  route: RouteGeometry
  stops: Stop[]
  logs: DailyLog[]
}

export type LocationPayload = Place | string

export interface TripRequestPayload {
  current_location: LocationPayload
  pickup_location: LocationPayload
  dropoff_location: LocationPayload
  cycle_used_hours: number
  start_time: string
  log_details: Partial<LogDetails>
}
