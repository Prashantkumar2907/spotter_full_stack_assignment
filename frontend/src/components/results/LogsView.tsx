import { useState } from 'react'
import { useSheetDownload } from '../../hooks/useSheetDownload'
import type { TripPlan } from '../../types/trip'
import { formatLongDay } from '../../utils/time'
import { LogSheet } from '../logs/sheet/LogSheet'
import { Dialog } from '../ui/Dialog'
import { Panel } from '../ui/Panel'
import { tabButtonId, tabPanelId } from '../ui/tabIds'
import { DaySummary } from './DaySummary'
import { LOG_TABS_PREFIX, LogToolbar } from './LogToolbar'
import styles from './LogsView.module.css'

export function LogsView({ plan }: { plan: TripPlan }) {
  const { logs } = plan
  const [day, setDay] = useState(logs[0].day_number)
  const [expanded, setExpanded] = useState(false)
  const log = logs.find((item) => item.day_number === day) ?? logs[0]
  const { svgRef, exporting, download } = useSheetDownload(`daily-log-${log.date}.png`)
  const title = `Day ${log.day_number} of ${logs.length} · ${formatLongDay(`${log.date}T00:00:00`)}`

  return (
    <div className={styles.view}>
      <Panel className={styles.sheetPanel} aria-label="Log sheet">
        <LogToolbar
          logs={logs}
          active={log}
          exporting={exporting}
          onSelect={setDay}
          onDownload={download}
          onExpand={() => setExpanded(true)}
        />
        <div
          className={styles.stage}
          role="tabpanel"
          id={tabPanelId(LOG_TABS_PREFIX)}
          aria-labelledby={tabButtonId(LOG_TABS_PREFIX, String(log.day_number))}
        >
          <button type="button" className={styles.sheetButton} onClick={() => setExpanded(true)} aria-label={`Open ${title} full screen`}>
            <LogSheet key={log.date} log={log} svgRef={svgRef} className={styles.sheet} />
          </button>
        </div>
      </Panel>
      <DaySummary key={log.date} log={log} />
      <Dialog open={expanded} title={title} onClose={() => setExpanded(false)}>
        <LogSheet log={log} className={styles.expandedSheet} />
      </Dialog>
    </div>
  )
}
