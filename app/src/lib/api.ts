const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

let accessToken: string | null = localStorage.getItem('accessToken')
let refreshToken: string | null = localStorage.getItem('refreshToken')

export function setTokens(at: string, rt: string) {
  accessToken = at
  refreshToken = rt
  localStorage.setItem('accessToken', at)
  localStorage.setItem('refreshToken', rt)
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function getAccessToken() {
  return accessToken
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const doRequest = (token: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    })

  let res = await doRequest(accessToken)

  if (res.status === 401) {
    const ok = await tryRefresh()
    if (ok) {
      res = await doRequest(accessToken)
    } else {
      clearTokens()
      window.location.href = '/login'
    }
  }

  return res
}
