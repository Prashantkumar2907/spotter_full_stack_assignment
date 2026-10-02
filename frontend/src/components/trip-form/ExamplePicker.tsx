import { Sparkles } from 'lucide-react'
import { TRIP_EXAMPLES, type TripExample } from '../../constants/examples'
import { SelectField } from '../ui/SelectField'

const OPTIONS = TRIP_EXAMPLES.map((example) => ({
  value: example.id,
  label: `${example.title} · ${example.summary}`,
}))

export function ExamplePicker({ onPick }: { onPick: (example: TripExample) => void }) {
  return (
    <SelectField
      label="Or start from an example"
      icon={Sparkles}
      placeholder="Choose an example trip"
      options={OPTIONS}
      value=""
      onChange={(event) => {
        const example = TRIP_EXAMPLES.find((item) => item.id === event.target.value)
        if (example) onPick(example)
      }}
    />
  )
}
