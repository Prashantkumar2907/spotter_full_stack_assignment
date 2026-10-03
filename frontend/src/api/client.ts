const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? ''
const NETWORK_MESSAGE = "Can't reach the trip planner. Check your connection, then try again."
const OFFLINE_MESSAGE = 'The trip planner service is not responding. Try again in a moment.'
const FALLBACK_MESSAGE = 'The planner could not complete that request. Please try again.'
const SERVER_ERROR_STATUS = 500

export type FieldErrors = Record<string, string[]>

export class ApiError extends Error {
  status: number
  code: string
  fields: FieldErrors

  constructor(message: string, status: number, code: string, fields: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; fields?: FieldErrors }
}

async function toApiError(response: Response): Promise<ApiError> {
  const body: ErrorBody = await response.json().catch(() => ({}))
  const detail = body.error
  const fallback = response.status >= SERVER_ERROR_STATUS ? OFFLINE_MESSAGE : FALLBACK_MESSAGE
  return new ApiError(
    detail?.message ?? fallback,
    response.status,
    detail?.code ?? 'unknown_error',
    detail?.fields,
  )
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(NETWORK_MESSAGE, 0, 'network_error')
  }
  if (!response.ok) throw await toApiError(response)
  return (await response.json()) as T
}

export function warmUpApi(): void {
  if (API_BASE_URL) void fetch(`${API_BASE_URL}/api/health/`, { cache: 'no-store' }).catch(() => undefined)
}

export function isRetryable(error: ApiError): boolean {
  return error.status === 0 || error.status >= SERVER_ERROR_STATUS
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
