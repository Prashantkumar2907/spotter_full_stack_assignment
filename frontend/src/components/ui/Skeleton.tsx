import { cx } from '../../utils/cx'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cx(styles.skeleton, className)} aria-hidden="true" />
}
