import { useState } from 'react'
import axios from 'axios'
import { ImageUploader } from '../components/ImageUploader'
import { ResultCard } from '../components/ResultCard'
import { api, type ScanResponse } from '../services/api'
import { Play, RotateCcw, AlertTriangle, BarChart3, Cpu, Layers } from 'lucide-react'
import { RESEARCH_IMAGES } from '../assets/images'

export function DashboardPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'prediction' | 'roc' | 'matrix' | 'radar'>('prediction')

  const handleSelectImage = (file: File) => {
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  const handleClear = () => {
    setSelectedFile(null)
    setResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await api.post<ScanResponse>('/api/scans/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setResult(response.data)
    } catch (err: unknown) {
      console.error('Screening request failed:', err)
      let errorMessage = 'Failed to perform glaucoma screening. Please ensure the backend services are running.'
      if (axios.isAxiosError(err)) {
        if (err.response?.data) {
          const data = err.response.data
          errorMessage = typeof data === 'string' ? data : (data.message ?? data.error ?? JSON.stringify(data))
        } else if (err.message) {
          errorMessage = err.message
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10 py-10 px-6 max-w-5xl mx-auto">
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-mono text-neutral-600 mb-1">
          <Layers className="w-3.5 h-3.5 text-neutral-800" />
          <span>MultiNet CNN + ANFIS Inference Pipeline</span>
        </div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
          Glaucoma Screening Dashboard
        </h1>
        <p className="text-xs text-neutral-500 max-w-xl">
          Upload a retinal fundus scan or select a sample research scan below to generate instant automated glaucoma risk evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Upload & Action */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-white p-6 border border-neutral-200 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">Fundus Image Source</h3>

            <ImageUploader
              onSelectImage={handleSelectImage}
              onClear={handleClear}
              selectedFile={selectedFile}
              disabled={loading}
            />

            {selectedFile && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow hover:shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Image...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Screening</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="inline-flex items-center justify-center p-2.5 text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output / Result Card */}
        <div className="md:col-span-6">
          {error && (
            <div className="p-4 bg-neutral-100 border border-neutral-300 text-neutral-900 rounded-xl text-xs space-y-1 mb-4">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Screening Error</span>
              </div>
              <p>{error}</p>
            </div>
          )}

          {result && <ResultCard result={result} />}

          {!result && !error && !loading && (
            <div className="border border-dashed border-neutral-300 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[340px] text-neutral-400 bg-white shadow-sm">
              <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-3 text-neutral-700">
                <Cpu className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-neutral-800">Awaiting Retinal Image Input</p>
              <p className="text-xs text-neutral-500 max-w-xs mt-1 leading-relaxed">
                Select one of the sample fundus images on the left or upload a scan, then click &quot;Run Screening&quot;.
              </p>
            </div>
          )}

          {loading && (
            <div className="border border-neutral-200 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[340px] bg-white shadow-sm space-y-3">
              <div className="w-8 h-8 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-900">Processing Retinal Fundus Scan</p>
                <p className="text-[11px] font-mono text-neutral-500">Executing MultiNet CNN + ANFIS inference pipeline...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Model Research Visualizations & Performance Section */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neutral-800" />
              <h2 className="text-base font-bold text-neutral-900">Research &amp; Model Evaluation Figures</h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Empirical visual artifacts from MultiNet CNN + ANFIS model evaluation
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200 text-xs">
            <button
              onClick={() => setActiveTab('prediction')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'prediction'
                  ? 'bg-neutral-900 text-white shadow'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Segmentation Output
            </button>
            <button
              onClick={() => setActiveTab('roc')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'roc'
                  ? 'bg-neutral-900 text-white shadow'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              ROC Curve
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'matrix'
                  ? 'bg-neutral-900 text-white shadow'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Confusion Matrix
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'radar'
                  ? 'bg-neutral-900 text-white shadow'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Radar &amp; Bar Comparison
            </button>
          </div>
        </div>

        {/* Tab Content Displaying Actual Research Images */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex flex-col items-center">
          {activeTab === 'prediction' && (
            <div className="space-y-3 text-center w-full max-w-2xl">
              <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm bg-white p-2">
                <img
                  src={RESEARCH_IMAGES.testPrediction}
                  alt="Optic Disc & Cup Segmentation Output"
                  className="w-full h-auto object-contain max-h-[380px] mx-auto"
                />
              </div>
              <p className="text-xs text-neutral-600 font-medium">
                Figure 1: MultiNet Test Prediction — Retinal fundus optic cup and neuroretinal disc boundary extraction.
              </p>
            </div>
          )}

          {activeTab === 'roc' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 text-center bg-white p-3 border border-neutral-200 rounded-lg shadow-sm">
                <img
                  src={RESEARCH_IMAGES.rocComparison}
                  alt="ROC Curve Comparison"
                  className="w-full h-auto object-contain max-h-[300px] mx-auto"
                />
                <p className="text-[11px] text-neutral-600 font-medium">
                  ROC Curve Comparison across CNN Architectures (AUC: 0.992)
                </p>
              </div>

              <div className="space-y-2 text-center bg-white p-3 border border-neutral-200 rounded-lg shadow-sm">
                <img
                  src={RESEARCH_IMAGES.prCurve}
                  alt="Precision-Recall Curve"
                  className="w-full h-auto object-contain max-h-[300px] mx-auto"
                />
                <p className="text-[11px] text-neutral-600 font-medium">
                  Precision-Recall (PR) Curve for Glaucomatous Classification
                </p>
              </div>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="space-y-3 text-center w-full max-w-xl">
              <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm bg-white p-3">
                <img
                  src={RESEARCH_IMAGES.confusionMatrix}
                  alt="Confusion Matrix"
                  className="w-full h-auto object-contain max-h-[360px] mx-auto"
                />
              </div>
              <p className="text-xs text-neutral-600 font-medium">
                Figure 2: Confusion Matrix evaluating True Positives, True Negatives, False Positives &amp; False Negatives.
              </p>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2 text-center bg-white p-3 border border-neutral-200 rounded-lg shadow-sm">
                <img
                  src={RESEARCH_IMAGES.radarMultiNetANFIS}
                  alt="Radar Chart MultiNet ANFIS"
                  className="w-full h-auto object-contain max-h-[280px] mx-auto"
                />
                <p className="text-[11px] text-neutral-600 font-medium">
                  MultiNet + ANFIS Multi-dimensional Radar Metric Evaluation
                </p>
              </div>

              <div className="space-y-2 text-center bg-white p-3 border border-neutral-200 rounded-lg shadow-sm">
                <img
                  src={RESEARCH_IMAGES.groupedBar}
                  alt="Grouped Bar Performance Comparison"
                  className="w-full h-auto object-contain max-h-[280px] mx-auto"
                />
                <p className="text-[11px] text-neutral-600 font-medium">
                  Grouped Bar Chart Benchmark vs Baseline Architectures
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

