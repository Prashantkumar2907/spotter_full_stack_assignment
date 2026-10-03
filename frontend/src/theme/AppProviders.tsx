import { MantineProvider } from '@mantine/core'
import type { ReactNode } from 'react'
import { cssVariablesResolver, theme } from './theme'

interface AppProvidersProps {
  children: ReactNode
  env?: 'default' | 'test'
}

export function AppProviders({ children, env = 'default' }: AppProvidersProps) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme="auto" env={env}>
      {children}
    </MantineProvider>
  )
}
