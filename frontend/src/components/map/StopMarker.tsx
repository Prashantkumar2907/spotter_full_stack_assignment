import type { Marker as LeafletMarker } from 'leaflet'
import { memo, useEffect, useMemo, useRef } from 'react'
import { Marker, Popup } from 'react-leaflet'
import type { Stop } from '../../types/trip'
import { formatClock, formatDay, formatDuration } from '../../utils/time'
import { createStopIcon } from './createStopIcon'
import styles from './StopMarker.module.css'

interface StopMarkerProps {
  stop: Stop
  index: number
  selected: boolean
  onSelect: (id: number) => void
}

function StopMarkerComponent({ stop, index, selected, onSelect }: StopMarkerProps) {
  const markerRef = useRef<LeafletMarker>(null)
  const icon = useMemo(
    () => createStopIcon(stop.kind, { id: stop.id, selected, index }),
    [stop.kind, stop.id, selected, index],
  )

  useEffect(() => {
    if (selected) markerRef.current?.openPopup()
  }, [selected])

  return (
    <Marker
      ref={markerRef}
      position={[stop.lat, stop.lng]}
      icon={icon}
      zIndexOffset={selected ? 1000 : 0}
      eventHandlers={{ click: () => onSelect(stop.id) }}
    >
      <Popup closeButton={false} offset={[0, -4]}>
        <div className={styles.popup}>
          <p className={styles.title}>{stop.title}</p>
          <p className={styles.location}>{stop.location}</p>
          <p className={styles.meta}>
            {formatDay(stop.arrive)}, {formatClock(stop.arrive)}
            {stop.duration_minutes > 0 && ` · ${formatDuration(stop.duration_minutes)}`}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

export const StopMarker = memo(StopMarkerComponent)
