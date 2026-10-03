import { expect, test } from '@playwright/test'
import { mockPlan, plans, stubTiles } from './support'

test('the phone layout stacks the form and results without sideways scrolling', async ({ page }) => {
  await stubTiles(page)
  await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  await page.getByRole('button', { name: 'Try the FMCSA sample day' }).click()
  await expect(page.getByLabel('Trip summary')).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Itinerary' })).toBeVisible()
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(sideways).toBe(false)
})
