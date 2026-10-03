import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadClient(apiUrl: string) {
  vi.resetModules()
  vi.stubEnv('VITE_API_URL', apiUrl)
  return import('./client')
}

describe('warmUpApi', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('wakes a separately hosted backend with a health request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'))
    vi.stubGlobal('fetch', fetchMock)
    const { warmUpApi } = await loadClient('https://api.example.com')
    warmUpApi()
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/api/health/', { cache: 'no-store' })
  })

  it('does nothing when the API is served from the same origin', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { warmUpApi } = await loadClient('')
    warmUpApi()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ignores a backend that cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const { warmUpApi } = await loadClient('https://api.example.com')
    expect(() => warmUpApi()).not.toThrow()
  })
})
