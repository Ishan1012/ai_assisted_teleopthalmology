import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  generateClinicalReport,
  type ClinicalReportResponse,
  type ReportRequest,
  type ScanResponse
} from '../services/api'
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Database
} from 'lucide-react'

export function ReportPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Scan result passed from DashboardPage router navigation
  const scanData = (location.state?.scanResult as ScanResponse) || null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ClinicalReportResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    setError(null)

    // Build the request payload
    let req: ReportRequest = {}

    if (scanData) {
      let isPath = scanData.isPathological ?? false
      let diag = scanData.diagnosis ?? (isPath ? 'Glaucoma' : 'Normal')
      let conf = scanData.confidence ?? (isPath ? 0.895 : 0.942)
      let confPct = conf > 1 ? conf : conf * 100

      // Extract pipeline json if present
      let reduced_features: number[] | undefined
      let rule_firing_strengths: number[] | undefined
      let membership_degrees: number[][] | undefined

      if (scanData.pipelineJson) {
        try {
          const parsed = typeof scanData.pipelineJson === 'string'
            ? JSON.parse(scanData.pipelineJson)
            : scanData.pipelineJson
          reduced_features = parsed.reduced_features
          rule_firing_strengths = parsed.rule_firing_strengths
          membership_degrees = parsed.membership_degrees
        } catch {
          // ignore parse error
        }
      }

      req = {
        prediction: diag,
        glaucoma_probability: conf > 1 ? conf / 100 : conf,
        confidence_percentage: confPct,
        is_pathological: isPath,
        cup_to_disc_ratio_summary: isPath
          ? 'Elevated Cup-to-Disc Ratio (> 0.55) exhibiting neuroretinal rim thinning.'
          : 'Normal Cup-to-Disc Ratio (<= 0.50) with preserved neuroretinal rim.',
        recommendation: scanData.recommendation || undefined,
        reduced_features,
        rule_firing_strengths,
        membership_degrees
      }
    } else {
      // Default demo payload if navigated directly
      req = {
        prediction: 'Glaucoma',
        glaucoma_probability: 0.895,
        confidence_percentage: 89.5,
        is_pathological: true,
        cup_to_disc_ratio_summary: 'Elevated Cup-to-Disc Ratio (> 0.58) with superior neuroretinal rim notch.',
        recommendation: 'Urgent referral to an ophthalmologist for visual field testing (OCT/Pachy).'
      }
    }

    try {
      const data = await generateClinicalReport(req)
      setReportData(data)
    } catch (err: unknown) {
      console.error('Failed to generate report:', err)
      setError('Unable to generate clinical report. Please check that FastAPI backend and Gemini/Atlas are configured.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleCopy = () => {
    if (reportData?.report) {
      navigator.clipboard.writeText(reportData.report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const isHighRisk = scanData?.isPathological || reportData?.prediction.toLowerCase().includes('glaucoma')

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Screening Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Clinical Decision Support Report
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3" />
              RAG Augmented
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Synthesized via Google Gemini 2.0 Flash grounded in peer-reviewed ophthalmic guidelines (AAO, EGS, WHO).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg shadow-sm transition-all disabled:opacity-50"
            title="Regenerate Report"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!reportData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg shadow-sm transition-all disabled:opacity-50"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!reportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow transition-all disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Architecture & Pipeline Badge Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="w-8 h-8 rounded-lg bg-neutral-200/80 flex items-center justify-center text-neutral-800">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-500 font-medium">Vision Model</div>
            <div className="text-xs font-bold text-neutral-900 font-mono">MultiNet CNN + ANFIS</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="w-8 h-8 rounded-lg bg-neutral-200/80 flex items-center justify-center text-neutral-800">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-500 font-medium">Knowledge Store</div>
            <div className="text-xs font-bold text-neutral-900 font-mono">MongoDB Atlas Vector Search</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="w-8 h-8 rounded-lg bg-neutral-200/80 flex items-center justify-center text-neutral-800">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-500 font-medium">LLM Synthesizer</div>
            <div className="text-xs font-bold text-neutral-900 font-mono">Gemini 2.0 Flash</div>
          </div>
        </div>
      </div>

      {/* Patient Scan Snapshot Card */}
      {scanData && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isHighRisk
            ? 'bg-red-50/60 border-red-200'
            : 'bg-emerald-50/60 border-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isHighRisk ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isHighRisk ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">
                  Scan: {scanData.originalFilename || 'Fundus Image'}
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  isHighRisk ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  {scanData.diagnosis || (isHighRisk ? 'Glaucoma Indicated' : 'Normal')}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                Model Confidence: <span className="font-semibold">{scanData.confidence ? Math.round(scanData.confidence > 1 ? scanData.confidence : scanData.confidence * 100) : 90}%</span>
                {scanData.riskLevel && ` • Risk Level: ${scanData.riskLevel}`}
              </p>
            </div>
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            {scanData.createdAt ? new Date(scanData.createdAt).toLocaleString() : new Date().toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm space-y-4">
          <div className="w-10 h-10 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900">Generating Clinical Decision Support Report</h3>
            <p className="text-xs text-neutral-500 font-mono">
              1. Embedding scan biomarkers &gt; 2. Retrieving Atlas guidelines &gt; 3. Gemini clinical synthesis...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-900">Failed to Generate Report</h3>
            <p className="text-xs text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Report Content */}
      {reportData && !loading && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          {reportData.summary && (
            <div className="bg-neutral-900 text-white rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executive Summary</span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-100 font-medium">
                {reportData.summary}
              </p>
            </div>
          )}

          {/* Main Clinical Report Narrative */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="prose prose-sm max-w-none text-neutral-800 space-y-4">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold text-neutral-900 mt-6 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-neutral-900 rounded-full inline-block"></span>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold text-neutral-800 mt-4 mb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed my-2">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1 my-2 text-xs sm:text-sm text-neutral-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1 my-2 text-xs sm:text-sm text-neutral-700">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-neutral-900">{children}</strong>
                  ),
                  hr: () => <hr className="my-4 border-neutral-200" />
                }}
              >
                {reportData.report}
              </ReactMarkdown>
            </div>
          </div>

          {/* References & Evidence Section */}
          {reportData.sources && reportData.sources.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <BookOpen className="w-4 h-4 text-neutral-800" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Retrieved Clinical Evidence &amp; References
                </h3>
                <span className="ml-auto text-xs text-neutral-500 font-mono">
                  {reportData.sources.length} sources matched
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportData.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2 text-xs hover:border-neutral-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 line-clamp-1">{src.title}</span>
                      {src.score != null && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-neutral-200 text-neutral-800">
                          {Math.round(src.score * 100)}% match
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 leading-relaxed line-clamp-4 italic">
                      &quot;{src.excerpt}&quot;
                    </p>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      File: {src.source} • Chunk #{src.chunk_index}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
