import { Check, X } from 'lucide-react'
import { useId } from 'react'
import { useLocationCombobox } from '../../hooks/useCombobox'
import type { LocationValue } from '../../types/form'
import { ControlFrame } from '../ui/ControlFrame'
import { FieldShell } from '../ui/FieldShell'
import { fieldDescribedBy } from '../ui/fieldIds'
import { IconButton } from '../ui/IconButton'
import { Spinner } from '../ui/Spinner'
import { LocationOptions } from './LocationOptions'
import { optionId } from './optionId'
import styles from './LocationField.module.css'

interface LocationFieldProps {
  label: string
  placeholder: string
  value: LocationValue
  error?: string
  onChange: (value: LocationValue) => void
}

interface TrailingProps {
  label: string
  value: LocationValue
  loading: boolean
  onClear: () => void
}

function Trailing({ label, value, loading, onClear }: TrailingProps) {
  return (
    <>
      {loading && <Spinner size={16} />}
      {value.place && <Check size={16} className={styles.confirmed} aria-label="Place selected" />}
      {value.text && (
        <IconButton icon={X} label={`Clear ${label.toLowerCase()}`} size="sm" onClick={onClear} />
      )}
    </>
  )
}

interface ComboInputProps {
  id: string
  listId: string
  placeholder: string
  value: string
  error?: string
  combo: ReturnType<typeof useLocationCombobox>
}

function ComboInput({ id, listId, placeholder, value, error, combo }: ComboInputProps) {
  const active = combo.activeIndex >= 0 ? optionId(listId, combo.activeIndex) : undefined
  return (
    <input
      id={id}
      className={styles.input}
      role="combobox"
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      aria-expanded={combo.listVisible}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={active}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={fieldDescribedBy(id, undefined, error)}
      onChange={combo.handleChange}
      onFocus={combo.open}
      onBlur={combo.close}
      onKeyDown={combo.handleKeyDown}
    />
  )
}

export function LocationField({ label, placeholder, value, error, onChange }: LocationFieldProps) {
  const id = useId()
  const listId = `${id}-list`
  const combo = useLocationCombobox(value, onChange)
  const loading = combo.listVisible && combo.search.status === 'loading'
  const trailing = (
    <Trailing
      label={label}
      value={value}
      loading={loading}
      onClear={() => onChange({ text: '', place: null })}
    />
  )
  return (
    <FieldShell id={id} label={label} error={error}>
      <div className={styles.anchor}>
        <ControlFrame invalid={Boolean(error)} trailing={trailing}>
          <ComboInput
            id={id}
            listId={listId}
            placeholder={placeholder}
            value={value.text}
            error={error}
            combo={combo}
          />
        </ControlFrame>
        {combo.listVisible && (
          <LocationOptions
            id={listId}
            status={combo.search.status}
            options={combo.search.results}
            activeIndex={combo.activeIndex}
            onPick={combo.pick}
            onHover={combo.setActiveIndex}
          />
        )}
      </div>
    </FieldShell>
  )
}
