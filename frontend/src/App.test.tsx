import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { samplePlan } from './test/fixtures'

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
  render(<App />)
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
    render(<App />)
    expect(screen.getByRole('heading', { name: /Every mile planned/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Plan a trip' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Trip summary')).not.toBeInTheDocument()
  })

  it('blocks submission and explains what is missing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Plan trip' }))
    expect(await screen.findAllByText('Enter a location')).toHaveLength(3)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows the planning screen while the trip is being planned', async () => {
    let resolve: (response: Response) => void = () => undefined
    fetchMock.mockReturnValue(new Promise<Response>((done) => (resolve = done)))
    const user = userEvent.setup()
    render(<App />)
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
    expect(screen.getByRole('complementary', { name: 'Itinerary' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Plan a trip' })).not.toBeInTheDocument()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.log_details.shipping_document).toBe('101601')
  })

  it('opens the log sheets with a day list, sheet and day summary', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    const user = await planSample()
    await user.click(screen.getByRole('tab', { name: /Daily logs/ }))
    expect(screen.getByRole('navigation', { name: 'Daily logs' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /daily log for 2026-10-05/i }).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Day summary')).toBeInTheDocument()
  })

  it('edits the trip with every value kept, and can go back to the results', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    const user = await planSample()
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('combobox', { name: 'Drop-off' })).toHaveValue('Newark, NJ')
    await user.click(screen.getByRole('button', { name: 'Back to results' }))
    expect(screen.getByLabelText('Trip summary')).toBeInTheDocument()
  })

  it('starts a new trip with an empty form', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    const user = await planSample()
    await user.click(screen.getByRole('button', { name: 'New trip' }))
    expect(screen.getByRole('combobox', { name: 'Current location' })).toHaveValue('')
  })

  it('keeps the form and explains a server error', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 'location_not_found', message: "Could not find a US location matching 'Zzz'" } }, 422),
    )
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Coast to coast' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("Could not find a US location matching 'Zzz'")
    expect(screen.getByRole('combobox', { name: 'Pickup' })).toHaveValue('Denver, CO')
  })

  it('explains a network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'FMCSA sample' }))
    expect(await screen.findByText(/cannot reach the planner/i)).toBeInTheDocument()
  })

  it('adjusts cycle hours with the stepper', async () => {
    const user = userEvent.setup()
    render(<App />)
    const form = screen.getByRole('form', { name: 'Plan a trip' })
    await user.click(within(form).getByRole('button', { name: 'Increase cycle hours' }))
    expect(screen.getByLabelText('Cycle used (hrs)')).toHaveValue(0.5)
    await user.click(within(form).getByRole('button', { name: 'Decrease cycle hours' }))
    expect(screen.getByLabelText('Cycle used (hrs)')).toHaveValue(0)
  })
})
