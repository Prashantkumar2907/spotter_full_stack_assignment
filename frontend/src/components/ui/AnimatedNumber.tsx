import { useCountUp } from '../../hooks/useCountUp'

interface AnimatedNumberProps {
  value: number
  format: (value: number) => string
}

export function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const animated = useCountUp(value)
  return <span>{format(animated)}</span>
}
