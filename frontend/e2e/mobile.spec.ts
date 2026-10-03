import { expect, test } from '@playwright/test'
import { mockPlan, plans, stubTiles } from './support'

test('the phone layout stacks every screen without sideways scrolling', async ({ page }) => {
  await stubTiles(page)
  await mockPlan(page, plans.fmcsaSample)
  await page.goto('/')
  const sideways = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(await sideways()).toBe(false)
  await page.getByRole('button', { name: 'FMCSA sample', exact: true }).click()
  await expect(page.getByLabel('Trip summary')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Itinerary' })).toBeVisible()
  expect(await sideways()).toBe(false)
  await page.getByRole('tab', { name: /Daily logs/ }).click()
  await expect(page.getByRole('group', { name: 'Log sheet actions' })).toBeVisible()
  expect(await sideways()).toBe(false)
})
