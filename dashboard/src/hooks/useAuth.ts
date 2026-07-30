import { useState, useEffect, useCallback, createContext, useContext, type ReactNode, createElement } from 'react'
import axios from 'axios'
import { api, type User } from '../services/api'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; getNotDisplayedReason: () => string }) => void) => void
        }
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void
            error_callback?: (error: { message: string }) => void
          }) => { requestAccessToken: () => void }
        }
      }
    }
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    // Check if token is present in URL query params (from Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    if (urlToken) {
      localStorage.setItem('token', urlToken)
      // Clean up query param from URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return urlToken
    }
    return localStorage.getItem('token')
  })
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    const currentToken = urlToken || localStorage.getItem('token')
    return Boolean(currentToken)
  })

  const fetchCurrentUser = useCallback(async (authToken?: string) => {
    const activeToken = authToken || token || localStorage.getItem('token')
    if (!activeToken) {
      setLoading(false)
      return
    }

    try {
      const res = await api.get<User>('/api/auth/me')
      setUser(res.data)
    } catch (err: unknown) {
      // Any failure (401, network error, etc.) — clear the token so the user
      // is not left in a half-authenticated state that causes 401s downstream.
      console.warn('Could not fetch current user, clearing session:', err)
      localStorage.removeItem('token')
      localStorage.removeItem('user_profile')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const currentToken = token || localStorage.getItem('token')
    if (currentToken) {
      queueMicrotask(() => {
        void fetchCurrentUser(currentToken)
      })
    }
  }, [fetchCurrentUser, token])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password })
    const newToken = res.data.token
    const authUser = res.data.user

    localStorage.setItem('token', newToken)
    localStorage.setItem('user_profile', JSON.stringify(authUser))
    setToken(newToken)
    setUser(authUser)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/register', { name, email, password })
    const newToken = res.data.token
    const authUser = res.data.user

    localStorage.setItem('token', newToken)
    localStorage.setItem('user_profile', JSON.stringify(authUser))
    setToken(newToken)
    setUser(authUser)
  }, [])

  const loginWithGoogleCredential = useCallback(async (credentialToken: string) => {
    try {
      const base64Url = credentialToken.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const payload = JSON.parse(jsonPayload)

      const res = await api.post<{ token: string; user: User }>('/api/auth/google', {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleId: payload.sub,
      })

      const authToken = res.data.token
      const authUser = res.data.user

      localStorage.setItem('token', authToken)
      localStorage.setItem('user_profile', JSON.stringify(authUser))
      setToken(authToken)
      setUser(authUser)
    } catch (err: unknown) {
      console.error('Google token authentication error:', err)
      throw new Error('Failed to authenticate Google credentials with backend API.')
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || clientId.includes('your-google-client-id') || clientId.includes('mock-google-client-id')) {
      throw new Error('Google Client ID is not configured. Please set a valid VITE_GOOGLE_CLIENT_ID in dashboard/.env')
    }

    if (window.google?.accounts?.oauth2) {
      return new Promise<void>((resolve, reject) => {
        const tokenClient = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              reject(new Error(`Google OAuth Error: ${tokenResponse.error_description || tokenResponse.error}`))
              return
            }
            if (tokenResponse.access_token) {
              try {
                const userInfoRes = await axios.get<{
                  sub: string
                  email: string
                  name?: string
                  picture?: string
                }>('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                const { email, name, picture, sub } = userInfoRes.data

                const res = await api.post<{ token: string; user: User }>('/api/auth/google', {
                  email,
                  name: name || email.split('@')[0],
                  picture: picture || '',
                  googleId: sub,
                })

                const authToken = res.data.token
                const authUser = res.data.user

                localStorage.setItem('token', authToken)
                localStorage.setItem('user_profile', JSON.stringify(authUser))
                setToken(authToken)
                setUser(authUser)
                resolve()
              } catch (err) {
                console.error('Google profile fetch/auth error:', err)
                reject(err)
              }
            }
          },
          error_callback: (error) => {
            reject(new Error(`Google OAuth Popup Error: ${error.message}`))
          },
        })
        tokenClient.requestAccessToken()
      })
    } else if (window.google?.accounts?.id) {
      return new Promise<void>((resolve, reject) => {
        window.google?.accounts?.id.initialize({
          client_id: clientId,
          callback: async (response: { credential: string }) => {
            try {
              await loginWithGoogleCredential(response.credential)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
        })
        window.google?.accounts?.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            reject(
              new Error(
                `Google One-Tap not displayed (${notification.getNotDisplayedReason()}). Ensure http://localhost:5173 is added to Authorized JavaScript origins in Google Cloud Console.`
              )
            )
          }
        })
      })
    } else {
      throw new Error('Google Identity Services SDK is loading. Please try again in a moment.')
    }
  }, [loginWithGoogleCredential])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_profile')
    setToken(null)
    setUser(null)
    setLoading(false)
  }, [])

  return createElement(
    AuthContext.Provider,
    { value: { user, loading, token, login, register, loginWithGoogle, logout } },
    children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


