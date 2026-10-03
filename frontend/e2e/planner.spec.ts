import { expect, test } from '@playwright/test'
import { collectErrors, mockPlan, plans, stubTiles } from './support'

test.beforeEach(async ({ page }) => {
  await stubTiles(page)
})

test('empty state guides the user and validation blocks an empty submit', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Plan a compliant trip in seconds' })).toBeVisible()
  await page.getByRole('button', { name: 'Plan trip' }).click()
  await expect(page.getByText('Enter a place or pick one from the list')).toHaveCount(3)
})

test('the FMCSA sample plans one day and its sheet matches the official form', async ({ page }) => {
  const errors = collectErrors(page)
  const requests = await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  await page.getByRole('button', { name: 'Try the FMCSA sample day' }).click()

  await expect(page.getByRole('heading', { level: 2, name: /Richmond, VA.*Newark, NJ/ })).toBeVisible()
  await expect(page.getByLabel('Trip summary')).toContainText('325 mi')
  await expect(page.getByRole('complementary', { name: 'Itinerary' })).toContainText('Drop-off')
  expect(requests[0]).toMatchObject({ cycle_used_hours: 0, log_details: { shipping_document: '101601' } })

  await page.getByRole('tab', { name: /Log sheets/ }).click()
  const sheet = page.getByRole('img', { name: /daily log for 2026-10-05/i })
  await expect(sheet).toBeVisible()
  for (const text of ['Drivers Daily Log', 'Remarks', 'Recap:', '=24.00', '101601', '123, 20544']) {
    await expect(sheet.getByText(text, { exact: true })).toBeVisible()
  }
  await expect(sheet.locator('g[transform*="rotate(60)"] text')).toHaveText(['Richmond, VA', 'Newark, NJ'])
  expect(errors).toEqual([])
})

test('a sheet can be expanded and closed with Escape', async ({ page }) => {
  await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await page.getByRole('tab', { name: /Log sheets/ }).click()
  await page.getByRole('button', { name: 'Expand sheet' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('img', { name: /daily log/i })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('a sheet downloads as PNG', async ({ page }) => {
  await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await page.getByRole('tab', { name: /Log sheets/ }).click()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PNG' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('daily-log-2026-10-05.png')
})

test('a multi-day trip with a 34-hour restart has a sheet and itinerary day for every day', async ({ page }) => {
  await mockPlan(page, plans.cycleLimit)
  await page.goto('/')
  await page.getByRole('button', { name: 'Near 70 h limit' }).click()

  const itineraryDays = page.getByRole('tablist', { name: 'Itinerary days' }).getByRole('tab')
  await expect(itineraryDays).toHaveCount(5)
  await expect(page.getByRole('complementary', { name: 'Itinerary' })).toContainText('34-hour restart')

  await page.getByRole('tab', { name: /Log sheets \(5\)/ }).click()
  const logDays = page.getByRole('tablist', { name: 'Log sheet days' }).getByRole('tab')
  await expect(logDays).toHaveCount(5)
  await logDays.nth(1).click()
  await expect(page.getByRole('img', { name: /daily log for 2026-10-06/i })).toContainText('24.00')
})

test('planning again while the log tab is open does not crash the map', async ({ page }) => {
  const errors = collectErrors(page)
  let call = 0
  await page.route('**/api/trips/plan/', (route) => {
    const body = call++ === 0 ? plans.fmcsaSample : plans.cycleLimit
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await page.getByRole('tab', { name: /Log sheets/ }).click()
  await page.getByRole('button', { name: 'Near 70 h limit' }).click()
  await expect(page.getByRole('tab', { name: /Log sheets \(5\)/ })).toBeVisible()
  await page.getByRole('tab', { name: 'Route and stops' }).click()
  await expect(page.getByLabel('Route map')).toBeVisible()
  expect(errors).toEqual([])
})

test('a server error is explained and the form keeps its values', async ({ page }) => {
  await mockPlan(page, { error: { code: 'route_not_found', message: 'No drivable road connects these locations' } }, 422)
  await page.goto('/')
  await page.getByRole('button', { name: 'Coast to coast' }).click()
  await expect(page.getByRole('alert')).toContainText('No drivable road connects these locations')
  await expect(page.getByRole('combobox', { name: 'Pickup location' })).toHaveValue('Denver, CO')
})

test('typed places are picked from suggestions and sent as coordinates', async ({ page }) => {
  await page.route('**/api/locations/search/**', (route) => {
    const query = new URL(route.request().url()).searchParams.get('q') ?? ''
    const place = { label: `${query} City, TX`, lat: 32.7, lng: -96.8 }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [place] }) })
  })
  const requests = await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  for (const [name, text] of [['Current location', 'Austin'], ['Pickup location', 'Waco'], ['Drop-off location', 'Plano']]) {
    await page.getByRole('combobox', { name }).fill(text)
    await expect(page.getByRole('option')).toHaveCount(1)
    await page.keyboard.press('Enter')
  }
  await page.getByRole('button', { name: 'Plan trip' }).click()
  await expect(page.getByLabel('Trip summary')).toBeVisible()
  expect(requests[0]).toMatchObject({ pickup_location: { label: 'Waco City, TX', lat: 32.7, lng: -96.8 } })
})

test('the desktop layout fits the window without page scrolling', async ({ page }) => {
  await mockPlan(page, plans.cycleLimit)
  await page.goto('/')
  await page.getByRole('button', { name: 'Near 70 h limit' }).click()
  await expect(page.getByLabel('Trip summary')).toBeVisible()
  for (const view of ['Route and stops', /Log sheets/]) {
    await page.getByRole('tab', { name: view }).click()
    const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
    expect(overflow).toBeLessThanOrEqual(0)
  }
})
