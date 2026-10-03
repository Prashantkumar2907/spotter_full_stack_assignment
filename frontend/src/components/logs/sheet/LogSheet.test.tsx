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
    expect(screen.getByLabelText('month 10')).toBeInTheDocument()
    expect(screen.getByLabelText('day 05')).toBeInTheDocument()
    expect(screen.getByLabelText('year 2026')).toBeInTheDocument()
    for (const text of ["John Doe's Transportation", 'Washington, D.C.', '123, 20544', '101601']) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    expect(screen.getAllByText('324.8')).toHaveLength(2)
  })

  it('totals each duty line in hours and minutes that add up to 24', () => {
    const { container } = render(<LogSheet log={sampleLog} />)
    expect(screen.getByText('TOTAL HOURS')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
    expect(container.querySelectorAll('rect[width="34"]')).toHaveLength(10)
  })

  it('flags each change of duty with the city and the activity, as in the video and FMCSA example', () => {
    const { container } = render(<LogSheet log={sampleLog} />)
    const flags = [...container.querySelectorAll('g.sheet-remark')].map((flag) =>
      [...flag.querySelectorAll('text')].map((node) => node.textContent),
    )
    expect(flags).toEqual([
      ['Richmond, VA', 'Pickup, loading'],
      ['Newark, NJ', 'Drop-off, unloading'],
    ])
  })

  it('marks both ends of every change of duty with a dot', () => {
    const { container } = render(<LogSheet log={sampleLog} />)
    expect(container.querySelectorAll('circle')).toHaveLength(8)
  })

  it('has the blank form sections in the given order', () => {
    render(<LogSheet log={sampleLog} />)
    for (const text of ['REMARKS', 'Shipping', 'Documents:', 'Recap:', '70 Hour/', 'Use time standard of home terminal.']) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
  })

  it('fills the 70 hour recap and circles the on-duty hours', () => {
    const { container } = render(<LogSheet log={sampleLog} />)
    expect(screen.getAllByText('7.92')).toHaveLength(3)
    expect(screen.getByText('62.08')).toBeInTheDocument()
    expect(container.querySelectorAll('ellipse')).toHaveLength(1)
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
