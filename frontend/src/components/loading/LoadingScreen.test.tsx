import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingScreen } from './LoadingScreen'

describe('LoadingScreen', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('announces planning politely and walks through the steps', () => {
    render(<LoadingScreen />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    const steps = () => screen.getAllByRole('listitem').map((item) => item.className)
    expect(steps()[0]).toMatch(/active/)
    act(() => vi.advanceTimersByTime(950))
    expect(steps()[0]).toMatch(/done/)
    expect(steps()[1]).toMatch(/active/)
    act(() => vi.advanceTimersByTime(5000))
    expect(steps()[2]).toMatch(/active/)
  })
})
