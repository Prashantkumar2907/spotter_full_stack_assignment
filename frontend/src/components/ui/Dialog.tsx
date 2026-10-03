import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { IconButton } from './IconButton'
import styles from './Dialog.module.css'

interface DialogProps {
  open: boolean
  title: string
  onClose: () => void
  actions?: ReactNode
  size?: 'full' | 'form'
  children: ReactNode
}

export function Dialog({ open, title, onClose, actions, size = 'full', children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className={cx(styles.dialog, styles[size])} aria-label={title} onClose={onClose}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.actions}>
          {actions}
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
      </header>
      <div className={styles.body}>{open && children}</div>
    </dialog>
  )
}
