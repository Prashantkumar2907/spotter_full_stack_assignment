import { Flag, LocateFixed, PackageOpen } from 'lucide-react'
import type { TripFormController } from '../../hooks/useTripForm'
import type { LocationKey } from '../../types/form'
import { LocationField } from './LocationField'

interface RouteFieldsProps {
  form: TripFormController
}

const FIELDS = [
  { key: 'current', label: 'Current location', placeholder: 'Where is the truck now?', icon: LocateFixed },
  { key: 'pickup', label: 'Pickup location', placeholder: 'Where do you load?', icon: PackageOpen },
  { key: 'dropoff', label: 'Drop-off location', placeholder: 'Where do you deliver?', icon: Flag },
] satisfies Array<{ key: LocationKey; label: string; placeholder: string; icon: typeof Flag }>

export function RouteFields({ form }: RouteFieldsProps) {
  return (
    <>
      {FIELDS.map(({ key, label, placeholder, icon }) => (
        <LocationField
          key={key}
          label={label}
          placeholder={placeholder}
          icon={icon}
          value={form.values[key]}
          error={form.errors[key]}
          onChange={(value) => form.setLocation(key, value)}
        />
      ))}
    </>
  )
}
