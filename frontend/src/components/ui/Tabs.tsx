import type { LucideIcon } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import { cx } from '../../utils/cx'
import styles from './Tabs.module.css'
import { tabButtonId, tabPanelId } from './tabIds'

export interface TabItem {
  id: string
  label: string
  icon?: LucideIcon
  meta?: ReactNode
}

interface TabsProps {
  label: string
  idPrefix: string
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  variant?: 'pill' | 'cards'
  compact?: boolean
  orientation?: 'horizontal' | 'vertical'
}

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown'])
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp'])

function nextIndex(key: string, current: number, count: number): number | null {
  if (NEXT_KEYS.has(key)) return (current + 1) % count
  if (PREVIOUS_KEYS.has(key)) return (current - 1 + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}

function useIndicator(value: string): RefObject<HTMLDivElement | null> {
  const listRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!list || !active) return
    list.style.setProperty('--indicator-x', `${active.offsetLeft}px`)
    list.style.setProperty('--indicator-w', `${active.offsetWidth}px`)
    active.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [value])
  return listRef
}

interface TabButtonProps {
  item: TabItem
  idPrefix: string
  selected: boolean
  onSelect: (id: string) => void
}

function TabButton({ item, idPrefix, selected, onSelect }: TabButtonProps) {
  const { id, label, icon: Icon, meta } = item
  return (
    <button
      id={tabButtonId(idPrefix, id)}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={tabPanelId(idPrefix)}
      tabIndex={selected ? 0 : -1}
      className={styles.tab}
      onClick={() => onSelect(id)}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      <span className={styles.text}>{label}</span>
      {meta}
    </button>
  )
}

export function Tabs({
  label,
  idPrefix,
  items,
  value,
  onChange,
  variant = 'pill',
  compact = false,
  orientation = 'horizontal',
}: TabsProps) {
  const listRef = useIndicator(value)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = nextIndex(event.key, items.findIndex((item) => item.id === value), items.length)
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
      aria-orientation={orientation}
      className={cx(styles.list, styles[variant], compact && styles.compact, styles[orientation])}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => (
        <TabButton key={item.id} item={item} idPrefix={idPrefix} selected={item.id === value} onSelect={onChange} />
      ))}
      {variant === 'pill' && <span className={styles.indicator} aria-hidden="true" />}
    </div>
  )
}
