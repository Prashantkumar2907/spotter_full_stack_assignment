import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

export function useProgress(active: boolean, durationMs: number): number {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active || reduced) return
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const value = Math.min(1, (now - startedAt) / durationMs)
      setProgress(value)
      if (value < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, durationMs, reduced])

  if (!active) return 0
  return reduced ? 1 : progress
}
