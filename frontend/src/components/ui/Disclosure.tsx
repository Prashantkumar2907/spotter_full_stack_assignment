import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import styles from './Disclosure.module.css'

interface DisclosureProps {
  title: string
  icon?: LucideIcon
  children: ReactNode
}

export function Disclosure({ title, icon: Icon, children }: DisclosureProps) {
  const [open, setOpen] = useState(false)
  const contentId = useId()
  return (
    <div className={styles.disclosure}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
      >
        {Icon && <Icon size={18} aria-hidden="true" />}
        <span className={styles.title}>{title}</span>
        <ChevronDown size={18} className={styles.chevron} aria-hidden="true" />
      </button>
      {open && (
        <div id={contentId} className={styles.content}>
          {children}
        </div>
      )}
    </div>
  )
}
