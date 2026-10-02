import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sampleLog } from '../../../test/fixtures'
import { LogSheet } from './LogSheet'

describe('LogSheet', () => {
  it('renders the form title and accessible label', () => {
    render(<LogSheet log={sampleLog} />)
    expect(screen.getByRole('img', { name: /daily log for 2026-10-05/i })).toBeInTheDocument()
    expect(screen.getByText('Drivers Daily Log')).toBeInTheDocument()
  })

  it('fills the header fields', () => {
    render(<LogSheet log={sampleLog} />)
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('(month)')).toBeInTheDocument()
    expect(screen.getByText('05')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText("John Doe's Transportation")).toBeInTheDocument()
    expect(screen.getByText('Washington, D.C.')).toBeInTheDocument()
    expect(screen.getByText('123, 20544')).toBeInTheDocument()
    expect(screen.getByText('101601')).toBeInTheDocument()
    expect(screen.getAllByText('324.8')).toHaveLength(2)
  })

  it('shows the totals for each duty row and the 24 hour sum', () => {
    render(<LogSheet log={sampleLog} />)
    for (const total of ['16.08', '0.00', '5.92', '2.00', '= 24.00']) {
      expect(screen.getByText(total)).toBeInTheDocument()
    }
  })

  it('lists each change of duty with time and place', () => {
    render(<LogSheet log={sampleLog} />)
    expect(screen.getByText('6:00 AM')).toBeInTheDocument()
    expect(screen.getByText('12:55 PM')).toBeInTheDocument()
    expect(screen.getByText('Pickup, loading (on duty)')).toBeInTheDocument()
    expect(screen.getAllByText('Newark, NJ').length).toBeGreaterThanOrEqual(2)
  })

  it('fills the 70 hour recap boxes', () => {
    render(<LogSheet log={sampleLog} />)
    expect(screen.getAllByText('7.92')).toHaveLength(3)
    expect(screen.getByText('62.08')).toBeInTheDocument()
  })

  it('announces a completed restart in the recap note', () => {
    const restarted = { ...sampleLog, recap: { ...sampleLog.recap, restart_taken: true } }
    const { container } = render(<LogSheet log={restarted} />)
    expect(within(container as HTMLElement).getByText(/34-hour restart finished today/)).toBeInTheDocument()
  })

  it('draws the duty line from the segments', () => {
    const { container } = render(<LogSheet log={sampleLog} />)
    const path = container.querySelector('path.sheet-pen')
    expect(path?.getAttribute('d')).toMatch(/^M\d/)
    expect(path?.getAttribute('d')).toContain('V')
  })
})
