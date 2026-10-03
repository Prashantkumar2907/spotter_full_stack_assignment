import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { AppProviders } from '../theme/AppProviders'

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const wrapper = ({ children }: { children: ReactNode }) => <AppProviders env="test">{children}</AppProviders>
  return render(ui, { wrapper, ...options })
}
