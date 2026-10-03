import type { Page } from '@playwright/test'
import cycleLimit from './fixtures/cycle-limit.json' with { type: 'json' }
import fmcsaSample from './fixtures/fmcsa-sample.json' with { type: 'json' }

export const plans = { fmcsaSample, cycleLimit }

const BLANK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  'base64',
)

export async function stubTiles(page: Page) {
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: BLANK_PNG }),
  )
}

export async function mockPlan(page: Page, body: unknown, status = 200) {
  const requests: unknown[] = []
  await page.route('**/api/trips/plan/', async (route) => {
    requests.push(route.request().postDataJSON())
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  })
  return requests
}

export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}
