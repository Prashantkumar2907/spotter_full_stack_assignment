import { Loader } from '@mantine/core'

interface SpinnerProps {
  size?: number
  label?: string
}

export function Spinner({ size = 18, label }: SpinnerProps) {
  return (
    <Loader size={size} color="gray" type="oval" role={label ? 'status' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />
  )
}
