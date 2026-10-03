import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { Moon, Sun } from 'lucide-react'
import { IconButton } from '../ui/IconButton'

interface ColorSchemeToggleProps {
  className?: string
  tooltip?: 'bottom' | 'left'
}

export function ColorSchemeToggle({ className, tooltip = 'bottom' }: ColorSchemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme()
  const scheme = useComputedColorScheme('light')
  const next = scheme === 'dark' ? 'light' : 'dark'
  return (
    <IconButton
      icon={scheme === 'dark' ? Sun : Moon}
      label={`Switch to ${next} mode`}
      variant="outline"
      tooltip={tooltip}
      className={className}
      onClick={() => setColorScheme(next)}
    />
  )
}
