import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TRIP_EXAMPLES } from '../../constants/examples'
import { ExampleChips } from './ExampleChips'

describe('ExampleChips', () => {
  it('shows one chip per example', () => {
    render(<ExampleChips onPick={vi.fn()} disabled={false} />)
    expect(screen.getAllByRole('button')).toHaveLength(TRIP_EXAMPLES.length)
  })

  it('passes the chosen example back', async () => {
    const onPick = vi.fn()
    const user = userEvent.setup()
    render(<ExampleChips onPick={onPick} disabled={false} />)
    await user.click(screen.getByRole('button', { name: 'Coast to coast' }))
    expect(onPick).toHaveBeenCalledWith(TRIP_EXAMPLES.find((example) => example.id === 'cross-country'))
  })

  it('cannot be used while a plan is loading', () => {
    render(<ExampleChips onPick={vi.fn()} disabled />)
    for (const chip of screen.getAllByRole('button')) expect(chip).toBeDisabled()
  })
})
