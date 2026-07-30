import { Cpu, CheckCircle, Sliders, Layers, BarChart2, Activity, GitBranch, ShieldCheck, Lock, FileText, TrendingUp, Sparkles } from 'lucide-react'
import { RESEARCH_IMAGES } from '../assets/images'

export function AboutPage() {
  const metrics = [
    { model: 'MultiNet + ANFIS (Ours)', auc: 0.992, accuracy: 98.4, sensitivity: 97.8, specificity: 98.9 },
    { model: 'ResNet50 Baseline', auc: 0.941, accuracy: 92.1, sensitivity: 91.0, specificity: 93.2 },
    { model: 'MobileNetV2 Baseline', auc: 0.928, accuracy: 90.8, sensitivity: 89.4, specificity: 91.6 },
    { model: 'DenseNet121 Baseline', auc: 0.935, accuracy: 91.5, sensitivity: 90.2, specificity: 92.4 },
  ]

  const trainingPlotLabels = [
    'Model Training Loss Curve',
    'Validation Accuracy Progression',
    'ANFIS Rule Weight Convergence',
    'Feature Map Activation Loss',
    'MultiNet Ensemble Gradient Delta',
    'Validation ROC AUC Curve',
  ]

  return (
    <div className="space-y-12 py-12 px-6 max-w-5xl mx-auto">
      {/* Overview Section */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-700">
          <Layers className="w-3.5 h-3.5 text-neutral-900" />
          <span>Research Methodology</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
          CNN Ensemble + ANFIS Architecture
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
          ClearSight utilizes a hybrid neuro-fuzzy intelligence model for automated glaucoma screening. By combining deep convolution-based feature extraction with Adaptive Neuro-Fuzzy Inference Systems (ANFIS), the system bridges raw neural performance with rule-based explainability.
        </p>
      </section>

      {/* System Architecture Flowchart Diagram */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
          <GitBranch className="w-4 h-4 text-neutral-800" />
          <h2>End-to-End System Pipeline Architecture</h2>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex flex-col items-center">
          <img
            src={RESEARCH_IMAGES.flowChart3}
            alt="MultiNet CNN + ANFIS System Flowchart"
            className="w-full h-auto object-contain max-h-[420px] rounded"
          />
          <p className="text-xs text-neutral-500 mt-3 font-mono text-center">
            Figure A: End-to-end data pipeline from fundus image preprocessing to CNN feature encoding and ANFIS fuzzy inference.
          </p>
        </div>
      </section>

      {/* Model Benchmark Comparison Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-neutral-800" />
          <h2 className="text-xl font-bold text-neutral-900">Benchmark Performance Comparison</h2>
        </div>
        <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-900 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">AUC</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Sensitivity</th>
                <th className="py-3 px-4">Specificity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {metrics.map((m, idx) => (
                <tr key={idx} className={idx === 0 ? 'bg-neutral-50/70 font-semibold text-neutral-900' : ''}>
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    {idx === 0 && <CheckCircle className="w-4 h-4 text-neutral-900" />}
                    <span>{m.model}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{m.auc}</td>
                  <td className="py-3.5 px-4 font-mono">{m.accuracy}%</td>
                  <td className="py-3.5 px-4 font-mono">{m.sensitivity}%</td>
                  <td className="py-3.5 px-4 font-mono">{m.specificity}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Preprocessing & Fuzzy Rule Stages */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-6 border border-neutral-200 rounded-xl bg-white space-y-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-neutral-800" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Deep Feature Extraction</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            MultiNet extracts high-level structural encodings of the neuroretinal rim and optic cup boundaries from preprocessed fundus images.
          </p>
        </div>

        <div className="p-6 border border-neutral-200 rounded-xl bg-white space-y-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-neutral-800" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">ANFIS Fuzzy Rules</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            ANFIS maps extracted feature vectors through 8 Gaussian membership rules, generating intuitive firing strengths to output a final glaucoma probability score.
          </p>
        </div>
      </section>

      {/* Empirical Plots & Visual Research Gallery */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-neutral-800" />
          <h2 className="text-base font-bold text-neutral-900">Empirical Research Figures &amp; Curves</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg space-y-2 text-center">
            <img
              src={RESEARCH_IMAGES.rocComparison}
              alt="ROC Curve"
              className="w-full h-auto object-contain max-h-[260px] mx-auto rounded"
            />
            <p className="text-xs font-semibold text-neutral-800">ROC Curve Comparison</p>
          </div>

          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg space-y-2 text-center">
            <img
              src={RESEARCH_IMAGES.prCurve}
              alt="Precision Recall Curve"
              className="w-full h-auto object-contain max-h-[260px] mx-auto rounded"
            />
            <p className="text-xs font-semibold text-neutral-800">Precision-Recall Curve</p>
          </div>

          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg space-y-2 text-center">
            <img
              src={RESEARCH_IMAGES.confusionMatrix}
              alt="Confusion Matrix"
              className="w-full h-auto object-contain max-h-[260px] mx-auto rounded"
            />
            <p className="text-xs font-semibold text-neutral-800">Confusion Matrix Evaluation</p>
          </div>

          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg space-y-2 text-center">
            <img
              src={RESEARCH_IMAGES.radarMultiNetANFIS}
              alt="Radar Chart"
              className="w-full h-auto object-contain max-h-[260px] mx-auto rounded"
            />
            <p className="text-xs font-semibold text-neutral-800">MultiNet Radar Performance</p>
          </div>
        </div>

        {/* Model Comparative Radar Charts */}
        <div className="border-t border-neutral-100 pt-6 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-neutral-500">
            Individual Model Architecture Radar Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-50 p-2 border border-neutral-200 rounded-lg text-center space-y-1">
              <img src={RESEARCH_IMAGES.radarMultiNetANFIS} alt="MultiNet ANFIS" className="w-full h-28 object-contain" />
              <p className="text-[10px] font-bold text-neutral-900">MultiNet+ANFIS</p>
            </div>
            <div className="bg-neutral-50 p-2 border border-neutral-200 rounded-lg text-center space-y-1">
              <img src={RESEARCH_IMAGES.radarResNet} alt="ResNet18" className="w-full h-28 object-contain" />
              <p className="text-[10px] font-bold text-neutral-700">ResNet18</p>
            </div>
            <div className="bg-neutral-50 p-2 border border-neutral-200 rounded-lg text-center space-y-1">
              <img src={RESEARCH_IMAGES.radarMobileNet} alt="MobileNet" className="w-full h-28 object-contain" />
              <p className="text-[10px] font-bold text-neutral-700">MobileNetV2</p>
            </div>
            <div className="bg-neutral-50 p-2 border border-neutral-200 rounded-lg text-center space-y-1">
              <img src={RESEARCH_IMAGES.radarDenseNet} alt="DenseNet121" className="w-full h-28 object-contain" />
              <p className="text-[10px] font-bold text-neutral-700">DenseNet121</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 1: Training Dynamics & Epoch Loss Convergence Gallery */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neutral-800" />
              <h2 className="text-base font-bold text-neutral-900">Training Dynamics &amp; Epoch Loss Convergence</h2>
            </div>
            <p className="text-xs text-neutral-500">
              Loss optimization and accuracy progression curves tracked across model training iterations
            </p>
          </div>
          <span className="text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded border self-start sm:self-auto">
            6 Metric Plots
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {RESEARCH_IMAGES.trainingPlots.map((plotUrl, idx) => (
            <div key={idx} className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2 text-center group hover:border-neutral-400 transition-colors">
              <div className="overflow-hidden rounded border border-neutral-200 bg-white p-1">
                <img
                  src={plotUrl}
                  alt={`Training Plot ${idx + 14}`}
                  className="w-full h-36 object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-xs font-bold text-neutral-900">{trainingPlotLabels[idx]}</p>
              <p className="text-[10px] font-mono text-neutral-500">Plot #{idx + 14} — Convergence Curve</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEW SECTION 2: Clinical Safety, Ethical AI & Deployment Guidelines */}
      <section className="bg-neutral-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Clinical Triage Standards</span>
          </div>
          <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded border border-neutral-700">
            Explainable AI (XAI)
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Clinical Safety &amp; Deployment Framework</h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
            ClearSight is engineered to provide decision-support triage for tele-ophthalmology workflows. All automated evaluations adhere to strict ethical and clinical safety protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Triage Assistance Tool</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Designed as an assistive triage aid for primary health workers. Final diagnoses must always be validated by certified eye-care specialists.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Data Privacy &amp; Security</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Retinal fundus scans undergo client-side metadata stripping, TLS encrypted transport, and in-memory processing via Spring Boot — images are never persisted to any external storage.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Explainability &amp; Auditability</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Every probability output includes optic Cup-to-Disc Ratio (CDR) estimations and ANFIS rule firing strengths to eliminate uninterpretable predictions.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}


