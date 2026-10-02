import type { LucideIcon } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './Tabs.module.css'
import { tabButtonId, tabPanelId } from './tabIds'

export interface TabItem {
  id: string
  label: string
  icon?: LucideIcon
  badge?: ReactNode
}

interface TabsProps {
  label: string
  idPrefix: string
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  variant?: 'underline' | 'pill'
}

function nextIndex(key: string, current: number, count: number): number | null {
  if (key === 'ArrowRight') return (current + 1) % count
  if (key === 'ArrowLeft') return (current - 1 + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}

function useIndicator(value: string) {
  const listRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!list || !active) return
    list.style.setProperty('--indicator-x', `${active.offsetLeft}px`)
    list.style.setProperty('--indicator-w', `${active.offsetWidth}px`)
  }, [value])
  return listRef
}

export function Tabs({ label, idPrefix, items, value, onChange, variant = 'underline' }: TabsProps) {
  const listRef = useIndicator(value)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = items.findIndex((item) => item.id === value)
    const target = nextIndex(event.key, current, items.length)
    if (target === null) return
    event.preventDefault()
    onChange(items[target].id)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[target]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={cx(styles.list, styles[variant])}
      onKeyDown={handleKeyDown}
    >
      {items.map(({ id, label: text, icon: Icon, badge }) => (
        <button
          key={id}
          id={tabButtonId(idPrefix, id)}
          type="button"
          role="tab"
          aria-selected={id === value}
          aria-controls={tabPanelId(idPrefix)}
          tabIndex={id === value ? 0 : -1}
          className={styles.tab}
          onClick={() => onChange(id)}
        >
          {Icon && <Icon size={18} aria-hidden="true" />}
          {text}
          {badge}
        </button>
      ))}
      <span className={styles.indicator} aria-hidden="true" />
    </div>
  )
}
