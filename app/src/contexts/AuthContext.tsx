import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { apiFetch, setTokens, clearTokens, getAccessToken } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (getAccessToken()) {
      apiFetch('/auth/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((u) => setUser(u))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Erro ao fazer login')
    }

    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Erro ao criar conta')
    }

    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {})
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
