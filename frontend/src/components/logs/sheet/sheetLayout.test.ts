import { describe, expect, it } from 'vitest'
import type { LogSegment } from '../../../types/trip'
import {
  GRID_RIGHT,
  GRID_X,
  LABEL_MIN_GAP,
  activityLabel,
  buildDutyPath,
  buildRemarkMarks,
  changePoints,
  hourLabel,
  labelPositions,
  markAnchorX,
  remarkActivity,
  splitHoursMinutes,
  mergeAdjacent,
  minuteToX,
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

const fmcsaSegments: LogSegment[] = [
  { status: 'off_duty', activity: 'before_trip', start_minute: 0, end_minute: 360 },
  { status: 'on_duty', activity: 'pickup', start_minute: 360, end_minute: 450 },
  { status: 'driving', activity: 'drive', start_minute: 450, end_minute: 540 },
  { status: 'on_duty', activity: 'fuel', start_minute: 540, end_minute: 570 },
  { status: 'driving', activity: 'drive', start_minute: 570, end_minute: 720 },
  { status: 'off_duty', activity: 'break', start_minute: 720, end_minute: 780 },
  { status: 'driving', activity: 'drive', start_minute: 780, end_minute: 900 },
  { status: 'on_duty', activity: 'dropoff', start_minute: 900, end_minute: 930 },
  { status: 'driving', activity: 'drive', start_minute: 930, end_minute: 960 },
  { status: 'sleeper', activity: 'rest', start_minute: 960, end_minute: 1065 },
  { status: 'driving', activity: 'drive', start_minute: 1065, end_minute: 1140 },
  { status: 'on_duty', activity: 'dropoff', start_minute: 1140, end_minute: 1260 },
  { status: 'off_duty', activity: 'after_trip', start_minute: 1260, end_minute: 1440 },
]

const fmcsaRemarks = [
  [360, 'Richmond, VA'],
  [450, 'Richmond, VA'],
  [540, 'Fredericksburg, VA'],
  [570, 'Fredericksburg, VA'],
  [720, 'Baltimore, MD'],
  [780, 'Baltimore, MD'],
  [900, 'Philadelphia, PA'],
  [930, 'Philadelphia, PA'],
  [960, 'Cherry Hill, NJ'],
  [1065, 'Cherry Hill, NJ'],
  [1140, 'Newark, NJ'],
  [1260, 'Newark, NJ'],
].map(([minute, location]) => ({ minute: minute as number, location: location as string, note: '' }))

describe('remark brackets', () => {
  it('reproduces the six brackets of the FMCSA completed log', () => {
    expect(buildRemarkMarks(fmcsaSegments, fmcsaRemarks)).toEqual([
      { startMinute: 360, endMinute: 450, location: 'Richmond, VA', activities: ['pickup'] },
      { startMinute: 540, endMinute: 570, location: 'Fredericksburg, VA', activities: ['fuel'] },
      { startMinute: 720, endMinute: 780, location: 'Baltimore, MD', activities: ['break'] },
      { startMinute: 900, endMinute: 930, location: 'Philadelphia, PA', activities: ['dropoff'] },
      { startMinute: 960, endMinute: 1065, location: 'Cherry Hill, NJ', activities: ['rest'] },
      { startMinute: 1140, endMinute: 1260, location: 'Newark, NJ', activities: ['dropoff'] },
    ])
  })

  it('marks a trip that starts by driving with a single tick', () => {
    const marks = buildRemarkMarks(
      [segment('off_duty', 0, 480), segment('driving', 480, 960), segment('off_duty', 960, 990)],
      [
        { minute: 480, location: 'Los Angeles, CA', note: '' },
        { minute: 960, location: 'Cedar City, UT', note: '' },
      ],
    )
    expect(marks).toEqual([
      { startMinute: 480, endMinute: 480, location: 'Los Angeles, CA', activities: ['test'] },
      { startMinute: 960, endMinute: 990, location: 'Cedar City, UT', activities: ['test'] },
    ])
  })

  it('skips a status carried over from the previous day', () => {
    const marks = buildRemarkMarks(
      [segment('sleeper', 0, 330), segment('driving', 330, 600)],
      [{ minute: 330, location: 'Ferron, UT', note: '' }],
    )
    expect(marks).toEqual([{ startMinute: 330, endMinute: 330, location: 'Ferron, UT', activities: ['test'] }])
  })

  it('keeps rotated labels from overlapping', () => {
    const marks = [
      { startMinute: 600, endMinute: 630, location: 'A', activities: [] },
      { startMinute: 610, endMinute: 640, location: 'B', activities: [] },
      { startMinute: 900, endMinute: 930, location: 'C', activities: [] },
    ]
    const positions = labelPositions(marks)
    expect(positions[1] - positions[0]).toBeGreaterThanOrEqual(LABEL_MIN_GAP)
    expect(positions[2]).toBe(markAnchorX(marks[2]))
  })

  it('names what the driver did at each stop', () => {
    const mark = { startMinute: 0, endMinute: 30, location: 'Fond du Lac, WI', activities: ['fuel', 'break'] }
    expect(remarkActivity(mark)).toBe('Fuel / 30 min break')
    expect(activityLabel('drive_to_dropoff')).toBe('Start driving')
  })
})

describe('pen marks and totals', () => {
  it('puts a dot at both ends of every change of duty status', () => {
    const points = changePoints([segment('off_duty', 0, 390), segment('on_duty', 390, 420), segment('on_duty', 420, 450)])
    expect(points).toEqual([
      [minuteToX(390), rowCenterY('off_duty')],
      [minuteToX(390), rowCenterY('on_duty')],
    ])
  })

  it('writes totals as hours and quarter-hour minutes', () => {
    expect(splitHoursMinutes(8.5)).toEqual(['08', '30'])
    expect(splitHoursMinutes(24)).toEqual(['24', '00'])
    expect(splitHoursMinutes(0.25)).toEqual(['00', '15'])
  })

  it('labels the hour scale like the paper form', () => {
    expect([hourLabel(0), hourLabel(1), hourLabel(12), hourLabel(23)]).toEqual(['Midnight', '1', 'noon', '11'])
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
