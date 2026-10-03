import { Skeleton as MantineSkeleton } from '@mantine/core'

export function Skeleton({ className }: { className?: string }) {
  return <MantineSkeleton className={className} radius={0} aria-hidden="true" />
}
