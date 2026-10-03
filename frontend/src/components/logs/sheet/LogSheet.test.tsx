import { render, screen } from '@testing-library/react'
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
    for (const total of ['16.08', '5.92', '2.00', '=24.00']) {
      expect(screen.getByText(total)).toBeInTheDocument()
    }
  })

  it('writes each change-of-duty city under a bracket, like the FMCSA example', () => {
    const { container } = render(<LogSheet log={sampleLog} />)
    const labels = [...container.querySelectorAll('g[transform*="rotate(60)"] text')].map((node) => node.textContent)
    expect(labels).toEqual(['Richmond, VA', 'Newark, NJ'])
  })

  it('has the blank form sections in the given order', () => {
    render(<LogSheet log={sampleLog} />)
    for (const text of ['Remarks', 'Shipping', 'Documents:', 'Recap:', '70 Hour/', 'Use time standard of home terminal.']) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
  })

  it('fills the 70 hour recap boxes', () => {
    render(<LogSheet log={sampleLog} />)
    expect(screen.getAllByText('7.92')).toHaveLength(3)
    expect(screen.getByText('62.08')).toBeInTheDocument()
  })

  it('announces a completed restart in the recap note', () => {
    const restarted = { ...sampleLog, recap: { ...sampleLog.recap, restart_taken: true } }
    const { container } = render(<LogSheet log={restarted} />)
    expect(container.textContent).toMatch(/Restart\s*completed\s*today/)
  })

  it('draws the duty line from the segments', () => {
    const { container } = render(<LogSheet log={sampleLog} />)
    const path = container.querySelector('path.sheet-duty-line')
    expect(path?.getAttribute('d')).toMatch(/^M\d/)
    expect(path?.getAttribute('d')).toContain('V')
  })
})
