import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.clearsighteye.app'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface User {
  id: string
  googleId: string
  email: string
  name: string
  picture: string
  createdAt?: string
}

export interface ScanResponse {
  id: string
  userId: string
  originalFilename: string
  diagnosis: string | null
  confidence: number | null
  isPathological: boolean | null
  riskLevel: string | null
  recommendation: string | null
  pipelineJson: string | null
  createdAt?: string
}

/** @deprecated Use ScanResponse — kept for backwards compat during refactor */
export type ScreeningResponse = ScanResponse
