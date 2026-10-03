import { flushSync } from 'react-dom'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function withViewTransition(update: () => void): void {
  const reduced = window.matchMedia?.(REDUCED_MOTION_QUERY).matches
  if (!document.startViewTransition || reduced) {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}
