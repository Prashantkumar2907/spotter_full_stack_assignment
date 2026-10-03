import { Download, Maximize2, Printer } from 'lucide-react'
import type { DailyLog } from '../../types/trip'
import { partsFromSegments } from '../../utils/duty'
import { formatMiles } from '../../utils/format'
import { formatDay } from '../../utils/time'
import { IconButton } from '../ui/IconButton'
import { Spinner } from '../ui/Spinner'
import { Tabs } from '../ui/Tabs'
import { DutyBar } from './DutyBar'
import styles from './LogsView.module.css'

export const LOG_TABS_PREFIX = 'log-days'

interface LogsToolbarProps {
  logs: DailyLog[]
  active: DailyLog
  exporting: boolean
  onSelect: (day: number) => void
  onDownload: () => void
  onExpand: () => void
}

function DayMeta({ log }: { log: DailyLog }) {
  return (
    <>
      <span className={styles.dayMeta}>
        {formatDay(`${log.date}T00:00:00`)} · {formatMiles(log.total_miles)}
      </span>
      <DutyBar parts={partsFromSegments(log.segments)} size="sm" label={`Duty timeline for ${log.date}`} />
    </>
  )
}

export function LogActions({ exporting, onDownload, onExpand }: Omit<LogsToolbarProps, 'logs' | 'active' | 'onSelect'>) {
  return (
    <div className={styles.actions} role="group" aria-label="Log sheet actions">
      <IconButton icon={Maximize2} label="Expand sheet" onClick={onExpand} />
      {exporting ? (
        <span className={styles.busy}>
          <Spinner size={18} label="Preparing PNG" />
        </span>
      ) : (
        <IconButton icon={Download} label="Download PNG" onClick={onDownload} />
      )}
      <IconButton icon={Printer} label="Print all sheets" onClick={() => window.print()} />
    </div>
  )
}

export function LogsToolbar({ logs, active, exporting, onSelect, onDownload, onExpand }: LogsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.days}>
        <Tabs
          label="Log sheet days"
          idPrefix={LOG_TABS_PREFIX}
          variant="cards"
          value={String(active.day_number)}
          onChange={(id) => onSelect(Number(id))}
          items={logs.map((log) => ({
            id: String(log.day_number),
            label: `Day ${log.day_number}`,
            meta: <DayMeta log={log} />,
          }))}
        />
      </div>
      <LogActions exporting={exporting} onDownload={onDownload} onExpand={onExpand} />
    </div>
  )
}
