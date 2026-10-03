import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { samplePlan } from './test/fixtures'
import { renderWithProviders } from './test/render'

vi.mock('./components/map/RouteMap', () => ({
  default: () => <div data-testid="route-map" />,
}))

const fetchMock = vi.fn()

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function planSample() {
  const user = userEvent.setup()
  renderWithProviders(<App />)
  await user.click(screen.getByRole('button', { name: 'FMCSA sample' }))
  await screen.findByLabelText('Trip summary')
  return user
}

describe('App flow', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('opens on the full-screen trip form', () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('heading', { name: /Every mile planned/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Plan a trip' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Trip summary')).not.toBeInTheDocument()
  })

  it('blocks submission and explains what is missing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(screen.getByRole('button', { name: 'Plan trip' }))
    expect(await screen.findAllByText('Enter a location')).toHaveLength(3)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows the planning screen while the trip is being planned', async () => {
    let resolve: (response: Response) => void = () => undefined
    fetchMock.mockReturnValue(new Promise<Response>((done) => (resolve = done)))
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(screen.getByRole('button', { name: 'FMCSA sample' }))
    expect(await screen.findByRole('heading', { name: 'Planning your trip' })).toBeInTheDocument()
    resolve(jsonResponse(samplePlan))
    expect(await screen.findByLabelText('Trip summary')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Planning your trip' })).not.toBeInTheDocument()
  })

  it('switches to the full-screen results with the trip, stats and itinerary', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    await planSample()
    expect(screen.getByRole('heading', { level: 1, name: /Richmond, VA.*Newark, NJ/ })).toBeInTheDocument()
    const details = screen.getByRole('complementary', { name: 'Trip details' })
    expect(within(details).getByRole('region', { name: 'Itinerary' })).toBeInTheDocument()
    expect(within(details).getByLabelText('Trip summary')).toHaveTextContent('Distance')
    expect(screen.queryByRole('heading', { name: 'Plan a trip' })).not.toBeInTheDocument()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.log_details.shipping_document).toBe('101601')
  })

  it('opens the log sheets with day tabs, sheet actions, sheet and day summary', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    const user = await planSample()
    await user.click(screen.getByRole('tab', { name: /Daily logs/ }))
    expect(screen.getByRole('tablist', { name: 'Log sheet days' })).toBeInTheDocument()
    const actions = screen.getByRole('group', { name: 'Log sheet actions' })
    for (const name of ['Expand sheet', 'Download PNG', 'Print all sheets']) {
      expect(within(actions).getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('img', { name: /daily log for 2026-10-05/i }).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Day summary')).toBeInTheDocument()
  })

  it('edits the trip in a drawer over the results with every value kept', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    const user = await planSample()
    await user.click(screen.getByRole('button', { name: 'Edit trip' }))
    const drawer = screen.getByRole('dialog', { name: 'Edit trip' })
    expect(within(drawer).getByRole('combobox', { name: 'Drop-off' })).toHaveValue('Newark, NJ')
    expect(screen.queryByRole('heading', { name: /Every mile planned/ })).not.toBeInTheDocument()
    await user.click(within(drawer).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog', { name: 'Edit trip' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Trip summary')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('updates the plan from the drawer and keeps the results on screen', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(samplePlan)))
    const user = await planSample()
    await user.click(screen.getByRole('button', { name: 'Edit trip' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Edit trip' })).getByRole('button', { name: 'Update trip' }))
    expect(await screen.findByLabelText('Trip summary')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('dialog', { name: 'Edit trip' })).not.toBeInTheDocument()
  })

  it('reopens the drawer with the message when an update fails', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(samplePlan))
    const user = await planSample()
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { code: 'route_not_found', message: 'No drivable road' } }, 422))
    await user.click(screen.getByRole('button', { name: 'Edit trip' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Edit trip' })).getByRole('button', { name: 'Update trip' }))
    const drawer = await screen.findByRole('dialog', { name: 'Edit trip' })
    expect(await within(drawer).findByRole('alert')).toHaveTextContent('No drivable road')
    expect(within(drawer).getByRole('combobox', { name: 'Drop-off' })).toHaveValue('Newark, NJ')
  })

  it('starts a new trip with an empty form', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    const user = await planSample()
    await user.click(screen.getByRole('button', { name: 'New trip' }))
    expect(screen.getByRole('heading', { name: /Every mile planned/ })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Current location' })).toHaveValue('')
    expect(screen.queryByRole('button', { name: /back to results/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Trip summary')).not.toBeInTheDocument()
  })

  it('keeps the form and explains a server error', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 'location_not_found', message: "Could not find a US location matching 'Zzz'" } }, 422),
    )
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(screen.getByRole('button', { name: 'Coast to coast' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("Could not find a US location matching 'Zzz'")
    expect(screen.getByRole('combobox', { name: 'Pickup' })).toHaveValue('Denver, CO')
  })

  it('explains a network failure and plans again from the alert', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(jsonResponse(samplePlan))
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(screen.getByRole('button', { name: 'FMCSA sample' }))
    expect(await screen.findByText(/can't reach the trip planner/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByLabelText('Trip summary')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('explains a planner outage that returns no error body', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 502 }))
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(screen.getByRole('button', { name: 'FMCSA sample' }))
    expect(await screen.findByText(/service is not responding/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('offers no retry for a trip the planner rejected', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: 'route_not_found', message: 'No drivable road' } }, 422))
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(screen.getByRole('button', { name: 'FMCSA sample' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No drivable road')
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('adjusts cycle hours with the stepper', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const form = screen.getByRole('form', { name: 'Plan a trip' })
    await user.click(within(form).getByRole('button', { name: 'Increase cycle hours' }))
    expect(screen.getByLabelText('Cycle used (hrs)')).toHaveValue(0.5)
    await user.click(within(form).getByRole('button', { name: 'Decrease cycle hours' }))
    expect(screen.getByLabelText('Cycle used (hrs)')).toHaveValue(0)
    expect(within(form).getByRole('button', { name: 'Decrease cycle hours' })).toBeDisabled()
  })

  it('warns when the cycle is close to the 70-hour limit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const input = screen.getByLabelText('Cycle used (hrs)')
    expect(screen.getByText('On duty in the last 8 days')).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, '62')
    expect(screen.getByText(/Only 8 h left/)).toBeInTheDocument()
  })
})
