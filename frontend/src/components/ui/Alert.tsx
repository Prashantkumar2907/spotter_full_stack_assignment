import { Alert as MantineAlert, Group } from '@mantine/core'
import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

interface AlertProps {
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function Alert({ title, children, action }: AlertProps) {
  return (
    <MantineAlert role="alert" variant="light" color="red" radius="md" title={title} icon={<AlertTriangle size={18} aria-hidden="true" />}>
      <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
        {children}
        {action}
      </Group>
    </MantineAlert>
  )
}
