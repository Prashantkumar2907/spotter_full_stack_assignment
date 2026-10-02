import { describe, expect, it } from 'vitest'
import type { LogSegment } from '../../../types/trip'
import {
  GRID_RIGHT,
  GRID_X,
  buildDutyPath,
  computeLayout,
  mergeAdjacent,
  minuteToX,
  placeRemarks,
  rowCenterY,
  truncate,
  wrapText,
} from './sheetLayout'

const segment = (status: LogSegment['status'], start: number, end: number): LogSegment => ({
  status,
  activity: 'test',
  start_minute: start,
  end_minute: end,
})

describe('minuteToX', () => {
  it('maps midnight and the end of the day to the grid edges', () => {
    expect(minuteToX(0)).toBe(GRID_X)
    expect(minuteToX(1440)).toBe(GRID_RIGHT)
  })

  it('places noon in the middle of the grid', () => {
    expect(minuteToX(720)).toBe((GRID_X + GRID_RIGHT) / 2)
  })
})

describe('buildDutyPath', () => {
  it('draws horizontals joined by verticals at status changes', () => {
    const path = buildDutyPath([
      segment('off_duty', 0, 360),
      segment('on_duty', 360, 420),
      segment('driving', 420, 775),
    ])
    const y = (status: LogSegment['status']) => rowCenterY(status)
    expect(path).toBe(
      `M${minuteToX(0)} ${y('off_duty')}H${minuteToX(360)}` +
        `V${y('on_duty')}H${minuteToX(420)}` +
        `V${y('driving')}H${minuteToX(775)}`,
    )
  })

  it('merges adjacent segments that share a status', () => {
    const merged = mergeAdjacent([
      segment('on_duty', 0, 30),
      segment('on_duty', 30, 90),
      segment('driving', 90, 120),
    ])
    expect(merged).toHaveLength(2)
    expect(merged[0].end_minute).toBe(90)
  })

  it('keeps every status on its own row', () => {
    const rows = (['off_duty', 'sleeper', 'driving', 'on_duty'] as const).map(rowCenterY)
    expect(new Set(rows).size).toBe(4)
    expect([...rows].sort((a, b) => a - b)).toEqual(rows)
  })
})

describe('remarks layout', () => {
  const remarks = Array.from({ length: 7 }, (_, index) => ({
    minute: index * 60,
    location: `Place ${index}`,
    note: 'note',
  }))

  it('numbers remarks and fills columns top to bottom', () => {
    const placements = placeRemarks(remarks)
    expect(placements.map((item) => item.number)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(placements[0]).toMatchObject({ column: 0, row: 0 })
    expect(placements[3]).toMatchObject({ column: 1, row: 0 })
    expect(placements[6]).toMatchObject({ column: 2, row: 0 })
  })

  it('grows the sheet when there are many remarks', () => {
    expect(computeLayout(20).height).toBeGreaterThan(computeLayout(2).height)
  })
})

describe('text helpers', () => {
  it('wraps words without breaking them', () => {
    expect(wrapText('A. Total hours on duty last 7 days including today.', 20)).toEqual([
      'A. Total hours on',
      'duty last 7 days',
      'including today.',
    ])
  })

  it('truncates long text with an ellipsis', () => {
    expect(truncate('Fredericksburg, Virginia', 12)).toBe('Fredericksb…')
    expect(truncate('Short', 12)).toBe('Short')
  })
})
