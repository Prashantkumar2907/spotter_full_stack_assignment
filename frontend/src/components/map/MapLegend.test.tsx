import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MapLegend } from './MapLegend'

describe('MapLegend', () => {
  it('lists only the stop kinds on the trip', () => {
    render(<MapLegend kinds={new Set(['start', 'dropoff', 'fuel'])} showDeadhead={false} />)
    expect(screen.getByText('Fuel stop')).toBeInTheDocument()
    expect(screen.getByText('Drop-off')).toBeInTheDocument()
    expect(screen.queryByText('34-hour restart')).not.toBeInTheDocument()
    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
  })

  it('explains the dotted line when the truck drives empty to the pickup', () => {
    render(<MapLegend kinds={new Set(['start'])} showDeadhead />)
    expect(screen.getByText('Empty')).toBeInTheDocument()
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
