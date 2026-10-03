const milesFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const decimalFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatNumber(value: number): string {
  return milesFormat.format(value)
}

export function formatMiles(miles: number): string {
  return `${formatNumber(miles)} mi`
}

export function formatMilesDecimal(miles: number): string {
  return decimalFormat.format(miles)
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
