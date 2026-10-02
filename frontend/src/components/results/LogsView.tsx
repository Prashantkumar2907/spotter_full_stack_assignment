import { useState } from 'react'
import { useSheetDownload } from '../../hooks/useSheetDownload'
import type { TripPlan } from '../../types/trip'
import { tabButtonId, tabPanelId } from '../ui/tabIds'
import { LogSheet } from '../logs/sheet/LogSheet'
import { LOG_TABS_PREFIX, LogsToolbar } from './LogsToolbar'
import styles from './LogsView.module.css'

export function LogsView({ plan }: { plan: TripPlan }) {
  const { logs } = plan
  const [day, setDay] = useState(logs[0].day_number)
  const log = logs.find((item) => item.day_number === day) ?? logs[0]
  const { svgRef, exporting, download } = useSheetDownload(`daily-log-${log.date}.png`)

  return (
    <div className={styles.view}>
      <LogsToolbar logs={logs} active={log} exporting={exporting} onSelect={setDay} onDownload={download} />
      <div
        className={styles.stage}
        role="tabpanel"
        id={tabPanelId(LOG_TABS_PREFIX)}
        aria-labelledby={tabButtonId(LOG_TABS_PREFIX, String(log.day_number))}
      >
        <LogSheet key={log.date} log={log} svgRef={svgRef} className={styles.sheet} />
      </div>
    </div>
  )
}
