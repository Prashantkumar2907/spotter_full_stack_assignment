import { useMemo } from 'react'
import { Polyline } from 'react-leaflet'
import type { TripPlan } from '../../types/trip'
import { decodePolyline, splitAtPoint } from '../../utils/polyline'
import { FitRoute } from './mapEffects'
import { StopMarker } from './StopMarker'

interface RouteLayersProps {
  plan: TripPlan
  selectedStopId: number | null
  onSelectStop: (id: number) => void
}

const PICKUP_ROLE = 'pickup'

function useRoutePoints(plan: TripPlan) {
  return useMemo(() => {
    const points = decodePolyline(plan.route.polyline, plan.route.precision)
    const pickup = plan.route.waypoints.find((waypoint) => waypoint.role === PICKUP_ROLE)
    if (!pickup || points.length === 0) return { points, toPickup: [], toDropoff: points }
    const [toPickup, toDropoff] = splitAtPoint(points, [pickup.lat, pickup.lng])
    return { points, toPickup, toDropoff }
  }, [plan])
}

export function RouteLayers({ plan, selectedStopId, onSelectStop }: RouteLayersProps) {
  const { points, toPickup, toDropoff } = useRoutePoints(plan)
  return (
    <>
      <FitRoute points={points} />
      <Polyline positions={points} interactive={false} className="route-casing" />
      {toPickup.length > 1 && (
        <Polyline positions={toPickup} interactive={false} className="route-line route-line--deadhead" />
      )}
      <Polyline positions={toDropoff} interactive={false} className="route-line route-line--loaded" />
      {plan.stops.map((stop, index) => (
        <StopMarker
          key={stop.id}
          stop={stop}
          index={index}
          selected={stop.id === selectedStopId}
          onSelect={onSelectStop}
        />
      ))}
    </>
  )
}
