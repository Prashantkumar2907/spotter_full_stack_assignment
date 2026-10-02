import { useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { SEARCH_MIN_CHARACTERS } from '../constants/limits'
import type { LocationValue } from '../types/form'
import type { Place } from '../types/trip'
import { useLocationSearch } from './useLocationSearch'

function nextActive(key: string, current: number, count: number): number {
  if (key === 'ArrowDown') return Math.min(count - 1, current + 1)
  return Math.max(0, current - 1)
}

export function useLocationCombobox(value: LocationValue, onChange: (value: LocationValue) => void) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const search = useLocationSearch(value.text, open && value.place === null)
  const listVisible = open && value.place === null && value.text.trim().length >= SEARCH_MIN_CHARACTERS

  const pick = (place: Place) => {
    onChange({ text: place.label, place })
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ text: event.target.value, place: null })
    setOpen(true)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = search.results.length
    if (event.key === 'Escape') setOpen(false)
    if (!listVisible || count === 0) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(nextActive(event.key, activeIndex, count))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      pick(search.results[Math.max(0, activeIndex)])
    }
  }

  return {
    search,
    listVisible,
    activeIndex,
    setActiveIndex,
    pick,
    handleChange,
    handleKeyDown,
    open: () => setOpen(true),
    close: () => setOpen(false),
  }
}
