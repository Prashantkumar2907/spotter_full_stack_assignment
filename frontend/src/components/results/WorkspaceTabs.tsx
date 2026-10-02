import { FileText, Map } from 'lucide-react'
import { Tabs } from '../ui/Tabs'

export type WorkspaceView = 'route' | 'logs'

export const WORKSPACE_TABS_PREFIX = 'workspace'

interface WorkspaceTabsProps {
  value: WorkspaceView
  logCount: number
  onChange: (view: WorkspaceView) => void
}

export function WorkspaceTabs({ value, logCount, onChange }: WorkspaceTabsProps) {
  return (
    <Tabs
      label="Trip views"
      idPrefix={WORKSPACE_TABS_PREFIX}
      value={value}
      onChange={(id) => onChange(id as WorkspaceView)}
      items={[
        { id: 'route', label: 'Route and stops', icon: Map },
        { id: 'logs', label: `Log sheets (${logCount})`, icon: FileText },
      ]}
    />
  )
}
