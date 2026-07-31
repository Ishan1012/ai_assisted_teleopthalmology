import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ShieldAlert, ArrowRight, Eye, Sparkles, BrainCircuit, Activity, Cpu, Database, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react'
import { SAMPLE_FUNDUS_IMAGES, RESEARCH_IMAGES } from '../assets/images'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-24 py-12 px-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700 shadow-sm">
          <Eye className="w-3.5 h-3.5 text-neutral-900" />
          <span>CNN Ensemble + Adaptive Neuro-Fuzzy Inference System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Early Glaucoma Detection Powered by Explainable AI
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          ClearSight demonstrates peer-reviewed research combining deep feature extraction with fuzzy rule-based logic to detect glaucomatous damage in retinal fundus imagery.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm px-6 py-3 rounded-lg shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Go to Screening Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm px-6 py-3 rounded-lg shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Get Started &amp; Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 font-medium text-sm px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            Read the Research
          </Link>
        </div>

        {/* Hero Visual Preview featuring real fundus scans */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
            {SAMPLE_FUNDUS_IMAGES.map((sample) => (
              <div key={sample.id} className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 p-2.5 transition-all hover:shadow-md hover:border-neutral-300">
                <div className="h-32 rounded-lg overflow-hidden bg-black/5 mb-2 relative">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white">
                    224×224
                  </div>
                </div>
                <div className="space-y-1 px-0.5">
                  <span className="text-[10px] font-mono uppercase bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded font-semibold">
                    {sample.dataset}
                  </span>
                  <p className="text-xs font-bold text-neutral-900 truncate">{sample.name}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{sample.diagnosis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW SECTION 1: Bento Grid Feature Showcase */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
            <BrainCircuit className="w-3.5 h-3.5 text-neutral-800" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            Hybrid Intelligence Architecture Bento Grid
          </h2>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto">
            Combining state-of-the-art deep convolutional feature extractors with transparent neuro-fuzzy decision logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Spans 2 columns on desktop */}
          <div className="md:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all pointer-events-none"></div>

            <div className="space-y-3 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-white/10 text-neutral-300 px-2 py-0.5 rounded border border-white/10">
                  Core Innovation
                </span>
                <Cpu className="w-5 h-5 text-neutral-300" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                MultiNet Deep Feature Extraction Ensemble
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                Combines fine-tuned ResNet50, MobileNetV2, and DenseNet121 backbones to extract spatial optic nerve head representations, mitigating dataset bias and class imbalance.
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10 z-10 flex items-center justify-center">
              <img
                src={RESEARCH_IMAGES.flowChart3}
                alt="MultiNet Architecture Flowchart"
                className="w-full h-auto object-contain max-h-48 rounded"
              />
            </div>
          </div>

          {/* Card 2: 1 column */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200">
                  <TrendingUp className="w-4 h-4 text-neutral-800" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border">
                  AUC 0.992
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900">98.4% Classification Accuracy</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Outperforms standalone deep networks on public benchmark datasets with minimal false-negative rate.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-200 overflow-hidden flex items-center justify-center">
              <img
                src={RESEARCH_IMAGES.rocComparison}
                alt="ROC Comparison Curve"
                className="w-full h-28 object-contain"
              />
            </div>
          </div>

          {/* Card 3: 1 column */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200">
                  <Activity className="w-4 h-4 text-neutral-800" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border">
                  8 Gaussian Rules
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900">ANFIS Rule Interpretability</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Replaces black-box predictions with human-understandable Takagi-Sugeno fuzzy membership rules.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-200 overflow-hidden flex items-center justify-center">
              <img
                src={RESEARCH_IMAGES.radarMultiNetANFIS}
                alt="ANFIS Radar Performance"
                className="w-full h-28 object-contain"
              />
            </div>
          </div>

          {/* Card 4: Spans 2 columns on desktop */}
          <div className="md:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 hover:border-neutral-300 transition-all">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[11px] font-mono text-neutral-700 border">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-800" />
                <span>Optic Nerve Boundary Triage</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Automated Optic Disc &amp; Cup Segmentation</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Extracts Cup-to-Disc Ratio (CDR) physiological parameters. An elevated CDR ratio (&gt; 0.5) alerts clinicians to early-stage neuroretinal rim loss before permanent visual field damage occurs.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-2.5 py-1 rounded">
                  CDR Threshold &gt; 0.5
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  Precision: 97.8%
                </span>
              </div>
            </div>

            <div className="w-full sm:w-64 bg-neutral-50 border border-neutral-200 rounded-xl p-2 flex flex-col items-center flex-shrink-0">
              <img
                src={RESEARCH_IMAGES.testPrediction}
                alt="Optic Disc Segmentation Output"
                className="w-full h-auto object-contain max-h-36 rounded"
              />
              <span className="text-[10px] font-mono text-neutral-400 mt-1">Segmented Cup &amp; Disc Boundary</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Framing: "Sneak Thief of Sight" */}
      <section className="bg-neutral-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
          <ShieldAlert className="w-4 h-4 text-white" />
          <span>Clinical Motivation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Known as the &quot;Sneak Thief of Sight&quot;
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl">
          Glaucoma progresses silently without noticeable early symptoms until irreversible peripheral vision loss occurs. Over 50% of affected individuals remain undiagnosed in early stages. Automated AI-assisted screening provides rapid, scalable triage to prevent blindness.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-800 pt-6">
          <div>
            <div className="text-2xl font-black font-mono">50%+</div>
            <div className="text-xs text-neutral-400">Undiagnosed early cases</div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono">2nd</div>
            <div className="text-xs text-neutral-400">Leading cause of blindness worldwide</div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono">98.4%</div>
            <div className="text-xs text-neutral-400">Research ensemble accuracy</div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 2: Dataset Validation Benchmarks & Clinical Triage */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
              <Database className="w-4 h-4 text-neutral-900" />
              <span>Multi-Dataset Validation</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Benchmark Performance Matrix</h2>
            <p className="text-xs text-neutral-500">Validated across standardized clinical public datasets (ACRIMA, Drishti-GS, RIM-ONE)</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-100 border text-xs font-mono text-neutral-800">
              Sensitivity: <span className="font-bold">97.8%</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-neutral-100 border text-xs font-mono text-neutral-800">
              Specificity: <span className="font-bold">98.9%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-neutral-900">ACRIMA Dataset</span>
              <CheckCircle2 className="w-4 h-4 text-neutral-800" />
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              705 high-resolution fundus images annotated by specialist ophthalmologists for glaucomatous neuropathy evaluation.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-200 flex justify-between">
              <span>Ensemble Accuracy:</span>
              <span className="font-bold text-neutral-900">98.4%</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-neutral-900">Drishti-GS Benchmark</span>
              <CheckCircle2 className="w-4 h-4 text-neutral-800" />
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              101 optic nerve head fundus scans with expert ground-truth disc and cup segmentation boundaries.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-200 flex justify-between">
              <span>Cup Segmentation Dice:</span>
              <span className="font-bold text-neutral-900">0.941</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-neutral-900">RIM-ONE Dataset</span>
              <CheckCircle2 className="w-4 h-4 text-neutral-800" />
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Reference database for optic nerve head analysis providing precise CDR ground truth ratio benchmarks.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-200 flex justify-between">
              <span>AUC Benchmark:</span>
              <span className="font-bold text-neutral-900">0.992</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold">Ready to test automated fundus screening?</h3>
            <p className="text-xs text-neutral-400">Upload a scan or pick from research sample images in the live dashboard.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold px-5 py-2.5 rounded-lg transition-colors flex-shrink-0"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How it Works: 3-Step Feature Cards with Real Images */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
            <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
            <span>Interactive Screening Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">How ClearSight Works</h2>
          <p className="text-sm text-neutral-500">Three-stage pipeline from raw fundus upload to diagnostic insight</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-300 flex items-center justify-center text-xs font-mono font-bold text-neutral-900">
                01
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Upload Fundus Scan</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Upload a standard digital fundus photo or pick from real clinical research datasets (ACRIMA, Drishti-GS).
              </p>
            </div>
            <div className="rounded-lg overflow-hidden border border-neutral-200 h-28 bg-neutral-50">
              <img src={SAMPLE_FUNDUS_IMAGES[0].url} alt="Fundus sample" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-300 flex items-center justify-center text-xs font-mono font-bold text-neutral-900">
                02
              </div>
              <h3 className="text-base font-semibold text-neutral-900">CNN + ANFIS Inference</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                MultiNet extracts structural features, which are evaluated by ANFIS fuzzy membership rules.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden border border-neutral-200 h-28 bg-neutral-50 p-1 flex items-center justify-center">
              <img src={RESEARCH_IMAGES.flowChart1} alt="Architecture flowchart" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-300 flex items-center justify-center text-xs font-mono font-bold text-neutral-900">
                03
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Explainable Output</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Receive a probability score, model confidence, Cup-to-Disc Ratio summary, and segmented visual output.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden border border-neutral-200 h-28 bg-neutral-50 p-1 flex items-center justify-center">
              <img src={RESEARCH_IMAGES.testPrediction} alt="Test prediction output" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 1: AI Mascot Triage Assistant Showcase */}
      <section className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-neutral-500 to-neutral-300 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative bg-white p-4 rounded-3xl border border-neutral-200 shadow-xl flex flex-col items-center text-center">
                <img
                  src="/mascot.png"
                  alt="Dr. Fox AI Assistant"
                  className="w-36 h-36 object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
                <span className="mt-3 px-3 py-1 bg-neutral-900 text-white text-[11px] font-mono font-bold rounded-full border border-neutral-700">
                  Dr. Fox — AI Clinical Assistant
                </span>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px]">
                  Guided Screening &amp; Optic Nerve Head Risk Triage
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-neutral-200 text-xs font-mono border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Smart Medical Assistant Co-Pilot</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug">
              Meet Your Intelligent Tele-Ophthalmology Assistant
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Integrated directly into the screening workflow, Dr. Fox assists healthcare technicians by guiding fundus image capture quality, highlighting key cup-to-disc ratio anomalies, and delivering transparent risk evaluations without delay.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Instant Triage</h4>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Classifies fundus scans into Risk Categories in under 2 seconds.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Fuzzy Rule XAI</h4>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Provides human-interpretable ANFIS membership rule explanations.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Zero Storage</h4>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Scans are evaluated in-memory without persistent cloud image storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 2: Clinical Impact & Multi-Dataset Validation Benchmark */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
            <TrendingUp className="w-3.5 h-3.5 text-neutral-800" />
            <span>Clinical Benchmark Metrics</span>
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            Multi-Dataset Validation &amp; Global Impact
          </h2>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto">
            Rigorously evaluated across clinical datasets from diverse demographics and camera hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-2 text-center">
            <div className="text-3xl sm:text-4xl font-black text-neutral-900 font-mono">98.4%</div>
            <div className="text-xs font-bold text-neutral-800">Overall Accuracy</div>
            <p className="text-[11px] text-neutral-500">Achieved on independent ACRIMA clinical test split</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-2 text-center">
            <div className="text-3xl sm:text-4xl font-black text-neutral-900 font-mono">0.992</div>
            <div className="text-xs font-bold text-neutral-800">ROC AUC Score</div>
            <p className="text-[11px] text-neutral-500">Superior discrimination between normal &amp; glaucomatous eyes</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-2 text-center">
            <div className="text-3xl sm:text-4xl font-black text-neutral-900 font-mono">&lt; 2.0s</div>
            <div className="text-xs font-bold text-neutral-800">Inference Speed</div>
            <p className="text-[11px] text-neutral-500">Optimized PyTorch CPU pipeline on lightweight EC2</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-2 text-center">
            <div className="text-3xl sm:text-4xl font-black text-neutral-900 font-mono">100%</div>
            <div className="text-xs font-bold text-neutral-800">Explainable Logic</div>
            <p className="text-[11px] text-neutral-500">Every decision mapped to ANFIS membership rule strengths</p>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-bold text-neutral-900">
              Designed for Low-Resource Tele-Ophthalmology Deployment
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Glaucoma is the leading cause of irreversible blindness worldwide, affecting over 80 million people. ClearSight provides a fast, accurate triage co-pilot for primary health centers where trained ophthalmologists are unavailable.
            </p>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow hover:shadow-md flex-shrink-0"
          >
            <span>Explore Full Paper Metrics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}


