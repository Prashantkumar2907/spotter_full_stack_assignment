import { Download, Printer } from 'lucide-react'
import type { DailyLog } from '../../types/trip'
import { formatDay } from '../../utils/time'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import styles from './LogsView.module.css'

export const LOG_TABS_PREFIX = 'log-days'

interface LogsToolbarProps {
  logs: DailyLog[]
  active: DailyLog
  exporting: boolean
  onSelect: (day: number) => void
  onDownload: () => void
}

export function LogsToolbar({ logs, active, exporting, onSelect, onDownload }: LogsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.days}>
        <Tabs
          label="Log sheet days"
          idPrefix={LOG_TABS_PREFIX}
          variant="pill"
          value={String(active.day_number)}
          onChange={(id) => onSelect(Number(id))}
          items={logs.map((item) => ({ id: String(item.day_number), label: `Day ${item.day_number}` }))}
        />
        <p className={styles.date}>{formatDay(`${active.date}T00:00:00`)}</p>
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" size="sm" icon={Download} loading={exporting} onClick={onDownload}>
          Download PNG
        </Button>
        <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
          Print all sheets
        </Button>
      </div>
    </div>
  )
}
