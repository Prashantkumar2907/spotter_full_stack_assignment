import { MapPin } from 'lucide-react'
import type { SearchStatus } from '../../hooks/useLocationSearch'
import type { Place } from '../../types/trip'
import { cx } from '../../utils/cx'
import { optionId } from './optionId'
import styles from './LocationOptions.module.css'

interface LocationOptionsProps {
  id: string
  status: SearchStatus
  options: Place[]
  activeIndex: number
  onPick: (place: Place) => void
  onHover: (index: number) => void
}

function splitLabel(label: string): [string, string] {
  const [first, ...rest] = label.split(', ')
  return [first, rest.join(', ')]
}

function Notice({ children }: { children: string }) {
  return <li className={styles.notice}>{children}</li>
}

function statusNotice(status: SearchStatus, count: number): string | null {
  if (status === 'error') return 'Search is unavailable. Type a full place name and we will look it up.'
  if (status === 'loading' && count === 0) return 'Searching places…'
  if (status === 'ready' && count === 0) return 'No US places found. Try a city and state.'
  return null
}

export function LocationOptions({
  id,
  status,
  options,
  activeIndex,
  onPick,
  onHover,
}: LocationOptionsProps) {
  const notice = statusNotice(status, options.length)
  return (
    <ul id={id} role="listbox" className={styles.list}>
      {notice && <Notice>{notice}</Notice>}
      {options.map((place, index) => {
        const [primary, secondary] = splitLabel(place.label)
        return (
          <li
            key={`${place.lat},${place.lng}`}
            id={optionId(id, index)}
            role="option"
            aria-selected={index === activeIndex}
            className={cx(styles.option, index === activeIndex && styles.active)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(place)}
            onMouseEnter={() => onHover(index)}
          >
            <MapPin size={16} className={styles.pin} aria-hidden="true" />
            <span className={styles.text}>
              <span className={styles.primary}>{primary}</span>
              {secondary && <span className={styles.secondary}>{secondary}</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
