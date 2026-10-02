import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocateFixed } from 'lucide-react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LocationValue } from '../../types/form'
import type { Place } from '../../types/trip'
import { LocationField } from './LocationField'

const searchLocations = vi.fn()
vi.mock('../../api/trips', () => ({ searchLocations: (...args: unknown[]) => searchLocations(...args) }))

const RICHMOND: Place = { label: 'Richmond, VA', lat: 37.5, lng: -77.4 }
const ROCHESTER: Place = { label: 'Rochester, NY', lat: 43.1, lng: -77.6 }

function Harness({ onChange }: { onChange?: (value: LocationValue) => void }) {
  const [value, setValue] = useState<LocationValue>({ text: '', place: null })
  return (
    <LocationField
      label="Current location"
      placeholder="Where?"
      icon={LocateFixed}
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
    />
  )
}

describe('LocationField', () => {
  beforeEach(() => {
    searchLocations.mockReset()
    searchLocations.mockResolvedValue([RICHMOND, ROCHESTER])
  })

  it('shows suggestions after typing and selects one with the keyboard', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness onChange={onChange} />)
    const input = screen.getByRole('combobox', { name: 'Current location' })
    await user.type(input, 'Ri')
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(2)
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenLastCalledWith({ text: 'Rochester, NY', place: ROCHESTER })
    expect(input).toHaveValue('Rochester, NY')
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
  })

  it('selects a suggestion with the mouse', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByRole('combobox'), 'Ric')
    await user.click(await screen.findByRole('option', { name: /Richmond/ }))
    expect(screen.getByRole('combobox')).toHaveValue('Richmond, VA')
    expect(screen.getByLabelText('Place selected')).toBeInTheDocument()
  })

  it('forgets the picked place when the text is edited', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness onChange={onChange} />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'Ric')
    await user.click(await screen.findByRole('option', { name: /Richmond/ }))
    await user.type(input, 'x')
    expect(onChange).toHaveBeenLastCalledWith({ text: 'Richmond, VAx', place: null })
  })

  it('clears the field with the clear button', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByRole('combobox'), 'abc')
    await user.click(screen.getByRole('button', { name: /clear current location/i }))
    expect(screen.getByRole('combobox')).toHaveValue('')
  })

  it('does not search for a single character', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByRole('combobox'), 'R')
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(searchLocations).not.toHaveBeenCalled()
  })

  it('tells the user when search is unavailable', async () => {
    searchLocations.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByRole('combobox'), 'Zz')
    expect(await screen.findByText(/search is unavailable/i)).toBeInTheDocument()
  })
})
