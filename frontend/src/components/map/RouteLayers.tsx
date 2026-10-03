import { useCallback, useMemo, useState } from 'react'
import { Polyline } from 'react-leaflet'
import { useProgress } from '../../hooks/useProgress'
import type { TripReplay } from '../../hooks/useTripReplay'
import type { TripPlan } from '../../types/trip'
import { decodePolyline, splitAtPoint, type LatLng } from '../../utils/polyline'
import { ROUTE_PREVIEW_POINTS, decimate, easeInOut } from '../../utils/routeMotion'
import { FitRoute, type FitPadding } from './mapEffects'
import { StopMarker } from './StopMarker'
import { TravelMarker } from './TravelMarker'

interface RouteLayersProps {
  plan: TripPlan
  selectedStopId: number | null
  onSelectStop: (id: number) => void
  padding: FitPadding
  trip: TripReplay
}

const PICKUP_ROLE = 'pickup'

const DRAW_MS = 1600

function useRouteGeometry(plan: TripPlan) {
  return useMemo(() => {
    const points = decodePolyline(plan.route.polyline, plan.route.precision)
    const preview = decimate(points, ROUTE_PREVIEW_POINTS)
    const pickup = plan.route.waypoints.find((waypoint) => waypoint.role === PICKUP_ROLE)
    if (!pickup || points.length === 0) return { points, preview, toPickup: [] as LatLng[], toDropoff: points }
    const [toPickup, toDropoff] = splitAtPoint(points, [pickup.lat, pickup.lng])
    return { points, preview, toPickup, toDropoff }
  }, [plan])
}

function DrawingRoute({ points }: { points: LatLng[] }) {
  return (
    <>
      <Polyline positions={points} interactive={false} className="route-casing" />
      <Polyline positions={points} interactive={false} className="route-line route-line--loaded" />
    </>
  )
}

function DrawnRoute({ plan, selectedStopId, onSelectStop, geometry, trip }: Omit<RouteLayersProps, 'padding'> & {
  geometry: ReturnType<typeof useRouteGeometry>
}) {
  return (
    <>
      <Polyline positions={geometry.points} interactive={false} className="route-casing" />
      {geometry.toPickup.length > 1 && (
        <Polyline positions={geometry.toPickup} interactive={false} className="route-line route-line--deadhead" />
      )}
      <Polyline positions={geometry.toDropoff} interactive={false} className="route-line route-line--loaded" />
      {plan.stops.map((stop, index) => (
        <StopMarker key={stop.id} stop={stop} index={index} selected={stop.id === selectedStopId} onSelect={onSelectStop} />
      ))}
      <TravelMarker path={geometry.preview} trip={trip} />
    </>
  )
}

export function RouteLayers({ plan, selectedStopId, onSelectStop, padding, trip }: RouteLayersProps) {
  const geometry = useRouteGeometry(plan)
  const [fitted, setFitted] = useState(false)
  const markFitted = useCallback(() => setFitted(true), [])
  const progress = useProgress(fitted, DRAW_MS)
  const visibleCount = Math.max(2, Math.ceil(easeInOut(progress) * geometry.preview.length))
  return (
    <>
      <FitRoute points={geometry.points} padding={padding} onDone={markFitted} />
      {fitted && progress < 1 && <DrawingRoute points={geometry.preview.slice(0, visibleCount)} />}
      {progress >= 1 && (
        <DrawnRoute plan={plan} selectedStopId={selectedStopId} onSelectStop={onSelectStop} geometry={geometry} trip={trip} />
      )}
    </>
  )
}
