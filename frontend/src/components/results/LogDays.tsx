import { Download, Maximize2, Printer } from 'lucide-react'
import type { DailyLog } from '../../types/trip'
import { partsFromSegments } from '../../utils/duty'
import { formatMiles } from '../../utils/format'
import { formatDay } from '../../utils/time'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Tabs } from '../ui/Tabs'
import { DutyBar } from './DutyBar'
import styles from './LogsView.module.css'

export const LOG_TABS_PREFIX = 'log-days'

interface LogDaysProps {
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

function LogActions({ exporting, onDownload, onExpand }: Pick<LogDaysProps, 'exporting' | 'onDownload' | 'onExpand'>) {
  return (
    <div className={styles.actions} role="group" aria-label="Log sheet actions">
      <Button variant="secondary" size="sm" icon={Maximize2} onClick={onExpand} fullWidth aria-label="Expand sheet">
        Expand
      </Button>
      <Button variant="secondary" size="sm" icon={Download} loading={exporting} onClick={onDownload} fullWidth aria-label="Download PNG">
        Download
      </Button>
      <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()} fullWidth aria-label="Print all sheets">
        Print all
      </Button>
    </div>
  )
}

export function LogDays({ logs, active, exporting, onSelect, onDownload, onExpand }: LogDaysProps) {
  return (
    <Panel as="nav" className={styles.days} aria-label="Daily logs">
      <h2 className={styles.daysTitle}>Daily logs</h2>
      <div className={`${styles.dayList} scroll-thin`}>
        <Tabs
          label="Log sheet days"
          idPrefix={LOG_TABS_PREFIX}
          variant="cards"
          orientation="vertical"
          value={String(active.day_number)}
          onChange={(id) => onSelect(Number(id))}
          items={logs.map((log) => ({ id: String(log.day_number), label: `Day ${log.day_number}`, meta: <DayMeta log={log} /> }))}
        />
      </div>
      <LogActions exporting={exporting} onDownload={onDownload} onExpand={onExpand} />
    </Panel>
  )
}
