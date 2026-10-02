import type { ElementType, HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import styles from './Panel.module.css'

interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
}

export function Panel({ as: Tag = 'section', className, children, ...rest }: PanelProps) {
  return (
    <Tag className={cx(styles.panel, className)} {...rest}>
      {children}
    </Tag>
  )
}
