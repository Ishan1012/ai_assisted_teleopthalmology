import type { ScanResponse } from '../services/api'
import { AlertCircle, CheckCircle2, Info, Activity, FileImage } from 'lucide-react'

interface ResultCardProps {
  result: ScanResponse
}

export function ResultCard({ result }: ResultCardProps) {
  // Derive pathological status from diagnosis or isPathological flag
  const isGlaucoma =
    result.isPathological === true ||
    (result.diagnosis?.toLowerCase().includes('glaucoma') ?? false)

  // confidence is 0–1 from Spring (forwarded from FastAPI), scale to percent
  const confPercent =
    result.confidence != null
      ? Math.round(
          result.confidence > 1 ? result.confidence : result.confidence * 100
        )
      : null

  const riskLabel = result.riskLevel ?? (isGlaucoma ? 'High Risk' : 'Low Risk')
  const diagnosisLabel = result.diagnosis ?? (isGlaucoma ? 'Glaucoma Indicated' : 'Normal / Low Risk')

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          {isGlaucoma ? (
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-900 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{diagnosisLabel}</h3>
            <p className="text-xs text-neutral-500 font-mono flex items-center gap-1">
              <FileImage className="w-3 h-3" />
              {result.originalFilename ?? 'Unknown file'}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            isGlaucoma
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-neutral-100 text-neutral-800 border-neutral-300'
          }`}
        >
          {riskLabel}
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
          <div className={`text-2xl font-extrabold font-mono ${isGlaucoma ? 'text-neutral-900' : 'text-neutral-500'}`}>
            {isGlaucoma ? 'HIGH' : 'LOW'}
          </div>
          <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isGlaucoma ? 'bg-neutral-900' : 'bg-neutral-400'}`}
              style={{ width: isGlaucoma ? '85%' : '15%' }}
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
        <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
          <Info className="w-4 h-4 text-neutral-600" />
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
