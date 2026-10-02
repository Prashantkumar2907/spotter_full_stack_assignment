import type { ReactNode } from 'react'
import { FONT_BODY, FONT_MONO, INK, MUTED, PEN } from './sheetTheme'

interface TextProps {
  x: number
  y: number
  children: ReactNode
  size?: number
  weight?: number
  anchor?: 'start' | 'middle' | 'end'
  fill?: string
  family?: string
}

export function Label({
  x,
  y,
  children,
  size = 11,
  weight = 500,
  anchor = 'start',
  fill = INK,
  family = FONT_BODY,
}: TextProps) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      fill={fill}
      fontFamily={family}
    >
      {children}
    </text>
  )
}

export function Caption(props: Omit<TextProps, 'fill' | 'size'>) {
  return <Label size={10.5} fill={MUTED} {...props} />
}

export function PenText({ size = 14, ...props }: Omit<TextProps, 'fill' | 'family'>) {
  return <Label size={size} fill={PEN} family={FONT_MONO} weight={500} {...props} />
}

interface UnderlineProps {
  x1: number
  x2: number
  y: number
  width?: number
}

export function Underline({ x1, x2, y, width = 1 }: UnderlineProps) {
  return <line x1={x1} x2={x2} y1={y} y2={y} stroke={INK} strokeWidth={width} />
}

interface BoxProps {
  x: number
  y: number
  width: number
  height: number
}

export function Box({ x, y, width, height }: BoxProps) {
  return (
    <rect x={x} y={y} width={width} height={height} fill="none" stroke={INK} strokeWidth={1.2} />
  )
}
