import { ClipboardList, Map, Play, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/Button'
import styles from './EmptyOverlay.module.css'

const HIGHLIGHTS = [
  { icon: Map, text: 'Route with every fuel stop, break and rest' },
  { icon: ShieldCheck, text: '11 h driving, 14 h window and 70 h cycle applied' },
  { icon: ClipboardList, text: 'Filled-out daily log sheets, ready to print' },
]

export function EmptyOverlay({ onTrySample }: { onTrySample: () => void }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>Your trip will appear here</h2>
        <p className={styles.lead}>Enter the trip details, or start from a ready-made example.</p>
        <ul className={styles.list}>
          {HIGHLIGHTS.map(({ icon: Icon, text }, index) => (
            <li key={text} className={styles.item} style={{ ['--i' as string]: index }}>
              <span className={styles.icon}>
                <Icon size={18} aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
        <Button icon={Play} onClick={onTrySample}>
          Try the FMCSA sample day
        </Button>
      </div>
    </div>
  )
}
