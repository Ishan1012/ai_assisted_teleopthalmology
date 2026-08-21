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

export interface SourceChunk {
  title: string
  source: string
  chunk_index: number
  excerpt: string
  score?: number
}

export interface ClinicalReportResponse {
  prediction: string
  confidence_percentage: number
  report: string
  summary: string
  sources: SourceChunk[]
}

export interface ReportRequest {
  prediction?: string
  glaucoma_probability?: number
  confidence_percentage?: number
  is_pathological?: boolean
  cup_to_disc_ratio_summary?: string
  recommendation?: string
  reduced_features?: number[]
  rule_firing_strengths?: number[]
  membership_degrees?: number[][]
  patient_age?: number
  patient_notes?: string
}

export async function generateClinicalReport(req: ReportRequest): Promise<ClinicalReportResponse> {
  // Try Spring Boot gateway endpoint first, fallback to FastAPI direct if local dev
  try {
    const res = await api.post<ClinicalReportResponse>('/api/scans/report', req)
    return res.data
  } catch {
    // If running with direct FastAPI backend or proxy
    const directFastApiUrl = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000'
    const res = await axios.post<ClinicalReportResponse>(`${directFastApiUrl}/api/v1/screening/report`, req, {
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': 'clearsight_internal_secret_key_2026'
      }
    })
    return res.data
  }
}
