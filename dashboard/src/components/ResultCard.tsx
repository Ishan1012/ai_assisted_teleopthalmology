import type { ScanResponse } from '../services/api'
import { AlertCircle, CheckCircle2, Info, Activity, FileImage } from 'lucide-react'

interface ResultCardProps {
  result: ScanResponse
}

export function ResultCard({ result }: ResultCardProps) {
  // Determine risk category (HIGH, MODERATE, LOW)
  const recUpper = result.recommendation?.toUpperCase() ?? ''
  const riskUpper = result.riskLevel?.toUpperCase() ?? ''
  const diagUpper = result.diagnosis?.toUpperCase() ?? ''

  let riskCategory: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'

  if (
    riskUpper.includes('HIGH') ||
    diagUpper.includes('GLAUCOMA') ||
    result.isPathological === true ||
    recUpper.includes('HIGH RISK') ||
    recUpper.includes('GLAUCOMA')
  ) {
    riskCategory = 'HIGH'
  } else if (riskUpper.includes('MODERATE') || recUpper.includes('MODERATE')) {
    riskCategory = 'MODERATE'
  }

  // Derive confidence percentage from result.confidence or parse regex from recommendation text (e.g. "89.8%")
  let confPercent =
    result.confidence != null
      ? Math.round(
          result.confidence > 1 ? result.confidence : result.confidence * 100
        )
      : null

  if (confPercent == null && result.recommendation) {
    const match = result.recommendation.match(/(\d+(?:\.\d+)?)\s*%/)
    if (match && match[1]) {
      confPercent = Math.round(parseFloat(match[1]))
    }
  }

  // Color & Theme Mapping
  const style = {
    HIGH: {
      text: 'text-red-600',
      badge: 'bg-red-600 text-white border-red-600',
      iconBg: 'bg-red-600 text-white',
      progress: 'bg-red-600',
      progressWidth: '90%',
      riskText: 'HIGH',
      label: result.riskLevel ?? 'High Risk',
      diagnosis: result.diagnosis ?? 'Glaucoma Indicated',
    },
    MODERATE: {
      text: 'text-amber-600',
      badge: 'bg-amber-500 text-white border-amber-500',
      iconBg: 'bg-amber-500 text-white',
      progress: 'bg-amber-500',
      progressWidth: '55%',
      riskText: 'MODERATE',
      label: result.riskLevel ?? 'Moderate Risk',
      diagnosis: result.diagnosis ?? 'Moderate Risk Suspected',
    },
    LOW: {
      text: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconBg: 'bg-emerald-100 border border-emerald-300 text-emerald-700',
      progress: 'bg-emerald-500',
      progressWidth: '15%',
      riskText: 'LOW',
      label: result.riskLevel ?? 'Low Risk',
      diagnosis: result.diagnosis ?? 'Normal / Low Risk',
    },
  }[riskCategory]

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.iconBg}`}>
            {riskCategory === 'HIGH' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{style.diagnosis}</h3>
            <p className="text-xs text-neutral-500 font-mono flex items-center gap-1">
              <FileImage className="w-3 h-3" />
              {result.originalFilename ?? 'Unknown file'}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${style.badge}`}>
          {style.label}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Risk indicator */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Pathological Risk</span>
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className={`text-2xl font-extrabold font-mono ${style.text}`}>
            {style.riskText}
          </div>
          <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${style.progress}`}
              style={{ width: style.progressWidth }}
            />
          </div>
        </div>

        {/* Model confidence */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Model Confidence</span>
            <Info className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          {confPercent != null ? (
            <>
              <div className="text-2xl font-extrabold text-neutral-900 font-mono">
                {confPercent}%
              </div>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-neutral-700 transition-all duration-500"
                  style={{ width: `${confPercent}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-neutral-400 mt-1">Not available</div>
          )}
        </div>
      </div>

      {/* CDR Educational Explanation */}
      <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-neutral-900">
          <img src="/mascot.png" alt="Doctor Fox Assistant" className="w-6 h-6 object-contain" />
          <span>Optic Cup-to-Disc Ratio (CDR) Assessment</span>
        </div>
        <p className="leading-relaxed">
          The Cup-to-Disc Ratio evaluates neuroretinal rim thinning. An elevated CDR (&gt; 0.5) is a
          primary physiological marker of glaucomatous optic neuropathy, reflecting structural loss of
          retinal ganglion cells.
        </p>
      </div>

      {/* Clinical Recommendation */}
      {result.recommendation && (
        <div className="border-t border-neutral-100 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            Clinical Recommendation
          </h4>
          <p className="text-xs text-neutral-800 font-medium leading-relaxed">
            {result.recommendation}
          </p>
        </div>
      )}

      {/* Pipeline debug info (only if available) */}
      {result.pipelineJson && (
        <details className="border-t border-neutral-100 pt-4">
          <summary className="text-xs font-semibold text-neutral-400 cursor-pointer hover:text-neutral-600 select-none">
            Pipeline JSON
          </summary>
          <pre className="mt-2 text-[10px] text-neutral-500 overflow-auto max-h-40 bg-neutral-50 p-2 rounded">
            {result.pipelineJson}
          </pre>
        </details>
      )}
    </div>
  )
}
