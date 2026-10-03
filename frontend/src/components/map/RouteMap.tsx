import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import type { TripReplay } from '../../hooks/useTripReplay'
import type { TripPlan } from '../../types/trip'
import { hasDeadheadLeg, stopKindsPresent } from '../../utils/duty'
import { FocusStop, KeepSized, type FitPadding } from './mapEffects'
import { MapLegend } from './MapLegend'
import { RouteLayers } from './RouteLayers'
import styles from './RouteMap.module.css'

const US_CENTER: [number, number] = [39.2, -97.5]
const US_ZOOM = 4
const MIN_ZOOM = 3
const MAX_ZOOM = 18
const ZOOM_SNAP = 0.25
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

interface RouteMapProps {
  plan: TripPlan
  selectedStopId: number | null
  onSelectStop: (id: number) => void
  padding: FitPadding
  trip: TripReplay
}

export default function RouteMap({ plan, selectedStopId, onSelectStop, padding, trip }: RouteMapProps) {
  const selected = plan.stops.find((stop) => stop.id === selectedStopId)
  const planKey = `${plan.summary.start}-${plan.summary.end}-${plan.route.polyline.length}`
  return (
    <div className={styles.wrapper}>
      <MapContainer
        center={US_CENTER}
        zoom={US_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomSnap={ZOOM_SNAP}
        zoomControl={false}
        className={styles.map}
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={MAX_ZOOM} />
        <ZoomControl position="bottomleft" />
        <KeepSized />
        <FocusStop stop={selected} padding={padding} />
        <RouteLayers key={planKey} plan={plan} selectedStopId={selectedStopId} onSelectStop={onSelectStop} padding={padding} trip={trip} />
      </MapContainer>
      <MapLegend kinds={stopKindsPresent(plan.stops)} showDeadhead={hasDeadheadLeg(plan.route.waypoints)} />
    </div>
  )
}
