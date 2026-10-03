import { Download, Maximize2, Printer } from 'lucide-react'
import type { DailyLog } from '../../types/trip'
import { formatMiles } from '../../utils/format'
import { formatDay } from '../../utils/time'
import { IconButton } from '../ui/IconButton'
import { Tabs } from '../ui/Tabs'
import styles from './LogsView.module.css'

export const LOG_TABS_PREFIX = 'log-days'

interface LogToolbarProps {
  logs: DailyLog[]
  active: DailyLog
  exporting: boolean
  onSelect: (day: number) => void
  onDownload: () => void
  onExpand: () => void
}

function LogActions({ exporting, onDownload, onExpand }: Pick<LogToolbarProps, 'exporting' | 'onDownload' | 'onExpand'>) {
  return (
    <div className={styles.actions} role="group" aria-label="Log sheet actions">
      <IconButton icon={Maximize2} label="Expand sheet" variant="outline" onClick={onExpand} />
      <IconButton icon={Download} label="Download PNG" variant="outline" loading={exporting} onClick={onDownload} />
      <IconButton icon={Printer} label="Print all sheets" variant="outline" tooltip="left" onClick={() => window.print()} />
    </div>
  )
}

export function LogToolbar({ logs, active, exporting, onSelect, onDownload, onExpand }: LogToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <Tabs
        label="Log sheet days"
        idPrefix={LOG_TABS_PREFIX}
        value={String(active.day_number)}
        onChange={(id) => onSelect(Number(id))}
        items={logs.map((log) => ({ id: String(log.day_number), label: `Day ${log.day_number}` }))}
        compact
      />
      <p className={styles.dayMeta}>
        {formatDay(`${active.date}T00:00:00`)} · {formatMiles(active.total_miles)}
      </p>
      <LogActions exporting={exporting} onDownload={onDownload} onExpand={onExpand} />
    </div>
  )
}
