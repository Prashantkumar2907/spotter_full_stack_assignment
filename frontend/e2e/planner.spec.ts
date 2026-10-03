import { expect, test } from '@playwright/test'
import { collectErrors, mockPlan, plans, stubTiles } from './support'

test.beforeEach(async ({ page }) => {
  await stubTiles(page)
})

test('the start screen collects trip details first and validates them', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Every mile planned/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Plan a trip' })).toBeVisible()
  await page.getByRole('button', { name: 'Plan trip' }).click()
  await expect(page.getByText('Enter a location')).toHaveCount(3)
})

test('planning shows the loading screen, then full-screen results', async ({ page }) => {
  await page.route('**/api/trips/plan/', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(plans.fmcsaSample) })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Planning your trip' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: /Richmond, VA.*Newark, NJ/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Plan a trip' })).toBeHidden()
  await expect(page.getByLabel('Trip summary')).toContainText('325 mi')
})

test('the route draws in, then the stops and the travel marker appear', async ({ page }) => {
  await mockPlan(page, plans.cycleLimit)
  await page.goto('/')
  await page.getByRole('button', { name: 'Near 70 h limit' }).click()
  await expect(page.locator('.route-line--loaded')).toBeVisible({ timeout: 10_000 })
  await expect(page.locator('.stop-pin')).toHaveCount(plans.cycleLimit.stops.length)
  await expect(page.locator('.travel-pin')).toBeVisible()
  await expect(page.locator('.route-casing')).toHaveCount(1)
})

test('the map replays the trip stop by stop, with loading and rests', async ({ page }) => {
  const errors = collectErrors(page)
  await mockPlan(page, plans.cycleLimit)
  await page.goto('/')
  await page.getByRole('button', { name: 'Near 70 h limit' }).click()
  const replay = page.getByRole('region', { name: 'Trip replay' })
  await expect(replay.getByRole('button', { name: 'Pause replay' })).toBeVisible({ timeout: 10_000 })
  await replay.getByRole('button', { name: /Replay speed/ }).click()
  await replay.getByRole('button', { name: /Replay speed/ }).click()
  const bubble = page.locator('.travel-pin__label')
  await expect(bubble).toHaveText(/34-hour restart/, { timeout: 15_000 })
  await expect(bubble).toHaveText(/Loading/, { timeout: 15_000 })
  await expect(page.getByRole('region', { name: 'Itinerary' })).toContainText('Now')
  await expect(replay).toContainText('Trip complete', { timeout: 30_000 })
  await expect(replay.getByRole('button', { name: 'Replay trip' })).toBeVisible()
  expect(errors).toEqual([])
})

test('the FMCSA sample sheet is filled like a paper log', async ({ page }) => {
  const errors = collectErrors(page)
  const requests = await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await page.getByRole('tab', { name: /Daily logs/ }).click()
  const sheet = page.getByRole('img', { name: /daily log for 2026-10-05/i })
  for (const text of ['Drivers Daily Log', 'REMARKS', 'Recap:', 'TOTAL HOURS', '101601', '123, 20544']) {
    await expect(sheet.getByText(text, { exact: true })).toBeVisible()
  }
  await expect(sheet.locator('g.sheet-remark text:first-child')).toHaveText(['Richmond, VA', 'Newark, NJ'])
  await expect(sheet.locator('g.sheet-remark text:last-child')).toHaveText(['Pickup, loading', 'Drop-off, unloading'])
  await expect(page.getByLabel('Day summary')).toContainText('Drop-off, unloading')
  expect(requests[0]).toMatchObject({ cycle_used_hours: 0, log_details: { shipping_document: '101601' } })
  expect(errors).toEqual([])
})

test('a sheet expands full screen, closes with Escape and downloads as PNG', async ({ page }) => {
  await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await page.getByRole('tab', { name: /Daily logs/ }).click()
  await page.getByRole('button', { name: 'Expand sheet' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PNG' }).click()])
  expect(download.suggestedFilename()).toBe('daily-log-2026-10-05.png')
})

test('a 5-day trip with a 34-hour restart has a day for every sheet', async ({ page }) => {
  await mockPlan(page, plans.cycleLimit)
  await page.goto('/')
  await page.getByRole('button', { name: 'Near 70 h limit' }).click()
  await expect(page.getByRole('tablist', { name: 'Itinerary days' }).getByRole('tab')).toHaveCount(5)
  await expect(page.getByRole('region', { name: 'Itinerary' })).toContainText('34-hour restart')
  await page.getByRole('tab', { name: /Daily logs · 5/ }).click()
  const days = page.getByRole('tablist', { name: 'Log sheet days' }).getByRole('tab')
  await expect(days).toHaveCount(5)
  await days.nth(1).click()
  await expect(page.getByRole('img', { name: /daily log for 2026-10-06/i })).toContainText('TOTAL HOURS')
})

test('editing opens a drawer over the results with the values kept and updates the plan in place', async ({ page }) => {
  const errors = collectErrors(page)
  let call = 0
  await page.route('**/api/trips/plan/', (route) => {
    const body = call++ === 0 ? plans.fmcsaSample : plans.cycleLimit
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await page.getByRole('tab', { name: /Daily logs/ }).click()
  await page.getByRole('button', { name: 'Edit trip' }).click()
  const drawer = page.getByRole('dialog', { name: 'Edit trip' })
  await expect(drawer.getByRole('combobox', { name: 'Drop-off' })).toHaveValue('Newark, NJ')
  await expect(page.getByRole('heading', { name: /Every mile planned/ })).toBeHidden()
  await drawer.getByRole('button', { name: 'Update trip' }).click()
  await expect(drawer).toBeHidden()
  await expect(page.getByRole('tab', { name: /Daily logs · 5/ })).toBeVisible()
  await expect(page.getByLabel('Route map')).toBeVisible()
  expect(errors).toEqual([])
})

test('log sheet details open in a compact dialog that closes with Escape and keeps what was typed', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Log sheet details/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Log sheet details' })
  await dialog.getByLabel('Driver').fill('Maria Alvarez')
  const box = await dialog.boundingBox()
  expect(box?.width).toBeLessThanOrEqual(520)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('button', { name: /Log sheet details/ })).toContainText('1 added')
})

test('an unreachable planner offers a retry that plans the trip', async ({ page }) => {
  let call = 0
  await page.route('**/api/trips/plan/', (route) =>
    call++ === 0
      ? route.fulfill({ status: 502, contentType: 'text/plain', body: '' })
      : route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(plans.fmcsaSample) }),
  )
  await page.goto('/')
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('not responding')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByLabel('Trip summary')).toBeVisible()
})

test('a server error keeps the user on the form with the message', async ({ page }) => {
  await mockPlan(page, { error: { code: 'route_not_found', message: 'No drivable road connects these locations' } }, 422)
  await page.goto('/')
  await page.getByRole('button', { name: 'Coast to coast' }).click()
  await expect(page.getByRole('alert')).toContainText('No drivable road connects these locations')
  await expect(page.getByRole('combobox', { name: 'Pickup' })).toHaveValue('Denver, CO')
})

test('typed places are picked from suggestions and sent as coordinates', async ({ page }) => {
  await page.route('**/api/locations/search/**', (route) => {
    const query = new URL(route.request().url()).searchParams.get('q') ?? ''
    const place = { label: `${query} City, TX`, lat: 32.7, lng: -96.8 }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [place] }) })
  })
  const requests = await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  for (const [name, text] of [['Current location', 'Austin'], ['Pickup', 'Waco'], ['Drop-off', 'Plano']]) {
    await page.getByRole('combobox', { name }).fill(text)
    await expect(page.getByRole('option')).toHaveCount(1)
    await page.keyboard.press('Enter')
  }
  await page.getByRole('button', { name: 'Plan trip' }).click()
  await expect(page.getByLabel('Trip summary')).toBeVisible()
  expect(requests[0]).toMatchObject({ pickup_location: { label: 'Waco City, TX', lat: 32.7, lng: -96.8 } })
})

test('every screen fits the window without page scrolling', async ({ page }) => {
  await mockPlan(page, plans.cycleLimit)
  await page.goto('/')
  const overflow = () => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  expect(await overflow()).toBeLessThanOrEqual(0)
  await page.getByRole('button', { name: 'Near 70 h limit' }).click()
  await expect(page.getByLabel('Trip summary')).toBeVisible()
  expect(await overflow()).toBeLessThanOrEqual(0)
  await page.getByRole('tab', { name: /Daily logs/ }).click()
  expect(await overflow()).toBeLessThanOrEqual(0)
})
