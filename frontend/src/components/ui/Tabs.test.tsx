import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Tabs } from './Tabs'

const ITEMS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Bravo' },
  { id: 'c', label: 'Charlie' },
]

function Harness() {
  const [value, setValue] = useState('a')
  return (
    <>
      <Tabs label="Letters" idPrefix="letters" items={ITEMS} value={value} onChange={setValue} />
      <p>Selected {value}</p>
    </>
  )
}

describe('Tabs', () => {
  it('marks only the active tab as selected and focusable', () => {
    render(<Harness />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false'])
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1])
    expect(tabs[0]).toHaveAttribute('aria-controls', 'letters-panel')
  })

  it('switches on click', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('tab', { name: 'Charlie' }))
    expect(screen.getByText('Selected c')).toBeInTheDocument()
  })

  it('supports arrow, Home and End keys with wrap-around', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('Selected c')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Charlie' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Selected a')).toBeInTheDocument()
    await user.keyboard('{End}')
    expect(screen.getByText('Selected c')).toBeInTheDocument()
    await user.keyboard('{Home}')
    expect(screen.getByText('Selected a')).toBeInTheDocument()
  })
})
