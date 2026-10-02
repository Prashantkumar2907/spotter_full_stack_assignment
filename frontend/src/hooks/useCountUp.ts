import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

const DEFAULT_DURATION_MS = 700

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3
}

export function useCountUp(target: number, durationMs = DEFAULT_DURATION_MS): number {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(reduced ? target : 0)

  useEffect(() => {
    if (reduced) return
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs)
      setValue(target * easeOutCubic(progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, reduced])

  return reduced ? target : value
}
