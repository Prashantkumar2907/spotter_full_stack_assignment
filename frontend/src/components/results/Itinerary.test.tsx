import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { sampleLog, samplePlan } from '../../test/fixtures'
import type { Stop } from '../../types/trip'
import { Itinerary } from './Itinerary'

const restartStop: Stop = {
  ...samplePlan.stops[2],
  id: 3,
  kind: 'restart',
  title: '34-hour restart',
  location: 'Fruitland, ID',
  arrive: '2026-10-05T14:00:00',
  depart: '2026-10-07T00:00:00',
  duration_minutes: 2040,
}

describe('Itinerary', () => {
  it('shows stops as a timeline with drive legs between them', () => {
    render(<Itinerary stops={samplePlan.stops} logs={samplePlan.logs} selectedStopId={null} onSelectStop={vi.fn()} />)
    expect(screen.getAllByText('6:00 AM')).toHaveLength(2)
    expect(screen.getByText('12:55 PM')).toBeInTheDocument()
    expect(screen.getByText(/Drive 5 h 55 min · 325 mi/)).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('reports the selected stop', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<Itinerary stops={samplePlan.stops} logs={samplePlan.logs} selectedStopId={2} onSelectStop={onSelect} />)
    await user.click(screen.getByRole('button', { name: /Pickup/ }))
    expect(onSelect).toHaveBeenCalledWith(1)
    expect(screen.getByRole('button', { name: /Drop-off/ })).toHaveAttribute('aria-current', 'true')
  })

  it('explains a day that is spent entirely in a restart', async () => {
    const user = userEvent.setup()
    const logs = [sampleLog, { ...sampleLog, date: '2026-10-06', day_number: 2 }]
    render(<Itinerary stops={[...samplePlan.stops, restartStop]} logs={logs} selectedStopId={null} onSelectStop={vi.fn()} />)
    await user.click(screen.getByRole('tab', { name: 'Day 2' }))
    expect(screen.getByText(/34-hour restart at Fruitland, ID continues until/)).toBeInTheDocument()
  })
})
