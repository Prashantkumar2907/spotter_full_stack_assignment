import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './Alert.module.css'

interface AlertProps {
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function Alert({ title, children, action }: AlertProps) {
  return (
    <div className={styles.alert} role="alert">
      <AlertTriangle size={20} className={styles.icon} aria-hidden="true" />
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {children && <p className={styles.message}>{children}</p>}
      </div>
      {action}
    </div>
  )
}
