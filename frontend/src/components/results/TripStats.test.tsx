import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { samplePlan } from '../../test/fixtures'
import { TripStats } from './TripStats'

describe('TripStats', () => {
  it('labels every headline number', () => {
    render(<TripStats plan={samplePlan} />)
    const panel = screen.getByLabelText('Trip summary')
    for (const label of ['Distance', 'Driving', 'Trip time', 'Daily logs', 'Stops']) {
      expect(within(panel).getAllByText(label).length).toBeGreaterThan(0)
    }
    expect(within(panel).getByText('7 h 55 min')).toBeInTheDocument()
    expect(within(panel).getByText('0 fuel · 0 rests · 0 breaks')).toBeInTheDocument()
  })

  it('shows the duty mix with hours per status', () => {
    render(<TripStats plan={samplePlan} />)
    expect(screen.getByRole('img', { name: /hours by duty status/i })).toBeInTheDocument()
    expect(screen.getByText('5.9 h')).toBeInTheDocument()
    expect(screen.getByText('16.1 h')).toBeInTheDocument()
    expect(screen.queryByText('Sleeper berth')).not.toBeInTheDocument()
  })
})
