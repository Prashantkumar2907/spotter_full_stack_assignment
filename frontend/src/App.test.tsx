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

describe('App', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('starts with an empty state that invites the user to plan a trip', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Plan a trip' })).toBeInTheDocument()
    expect(screen.getByText('Plan a compliant trip in seconds')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Trip overview' })).toBeInTheDocument()
  })

  it('blocks submission and explains what is missing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Plan trip' }))
    expect(await screen.findAllByText('Enter a place or pick one from the list')).toHaveLength(3)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('plans the sample trip and shows the summary, itinerary and log sheet', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Try the FMCSA sample day' }))

    const summary = await screen.findByLabelText('Trip summary')
    expect(within(summary).getByText('Distance')).toBeInTheDocument()
    expect(await screen.findByRole('complementary', { name: 'Itinerary' })).toBeInTheDocument()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/trips/plan/')
    const body = JSON.parse(init.body as string)
    expect(body.current_location.label).toBe('Richmond, VA')
    expect(body.dropoff_location.label).toBe('Newark, NJ')
    expect(body.cycle_used_hours).toBe(0)
    expect(body.log_details.shipping_document).toBe('101601')

    await user.click(screen.getByRole('tab', { name: /Log sheets/ }))
    expect(await screen.findAllByRole('img', { name: /daily log for 2026-10-05/i })).not.toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeInTheDocument()
  })

  it('shows the server message when planning fails', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: { code: 'location_not_found', message: "Could not find a US location matching 'Zzz'" } },
        422,
      ),
    )
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Try the FMCSA sample day' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Could not plan this trip')
    expect(alert).toHaveTextContent("Could not find a US location matching 'Zzz'")
  })

  it('explains a network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Try the FMCSA sample day' }))
    expect(await screen.findByText(/cannot reach the planner/i)).toBeInTheDocument()
  })

  it('loads an example from the picker and plans it immediately', async () => {
    fetchMock.mockResolvedValue(jsonResponse(samplePlan))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Coast to coast' }))
    expect(await screen.findByLabelText('Trip summary')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Pickup location' })).toHaveValue('Denver, CO')
    expect(screen.getByLabelText('Current cycle used (hrs)')).toHaveValue(30)
  })

  it('adjusts cycle hours with the stepper', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Increase cycle hours' }))
    expect(screen.getByLabelText('Current cycle used (hrs)')).toHaveValue(0.5)
    await user.click(screen.getByRole('button', { name: 'Decrease cycle hours' }))
    await user.click(screen.getByRole('button', { name: 'Decrease cycle hours' }))
    expect(screen.getByLabelText('Current cycle used (hrs)')).toHaveValue(0)
  })
})
