import { useState, useEffect, useRef } from 'react'
import {
  Camera,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Wifi,
  Square,
} from 'lucide-react'

export interface IpWebcamCaptureProps {
  onCapture: (file: File) => void
  onClear?: () => void
  defaultUrl?: string
  disabled?: boolean
}

const PRESET_URLS = [
  'http://192.168.0.100:8080',
  'http://192.168.1.100:8080',
  'http://192.168.43.1:8080',
]

export function IpWebcamCapture({
  onCapture,
  onClear,
  defaultUrl = 'http://192.168.0.100:8080',
  disabled = false,
}: IpWebcamCaptureProps) {
  const [webcamUrl, setWebcamUrl] = useState(defaultUrl)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null)
  const [hasFirstFrameLoaded, setHasFirstFrameLoaded] = useState(false)

  // React hook safety refs
  const intervalRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)
  const isCapturingRef = useRef(false)
  const isStreamingRef = useRef(false)
  const consecutiveErrorsRef = useRef(0)
  const frameTimestampsRef = useRef<number[]>([])

  const imgRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Clean up on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (capturedPreviewUrl) {
        URL.revokeObjectURL(capturedPreviewUrl)
      }
    }
  }, [capturedPreviewUrl])

  const stopStream = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isStreamingRef.current = false
    setIsStreaming(false)
    setIsConnecting(false)
    setFps(0)
    frameTimestampsRef.current = []
  }

  const startStream = () => {
    if (disabled) return
    if (!webcamUrl.trim()) {
      setError('Please enter a valid IP Webcam URL.')
      return
    }

    // Clear previous state and timers
    stopStream()
    setError(null)
    setCapturedFile(null)
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl)
      setCapturedPreviewUrl(null)
    }

    consecutiveErrorsRef.current = 0
    isStreamingRef.current = true
    setIsStreaming(true)
    setIsConnecting(true)
    setHasFirstFrameLoaded(false)

    const cleanUrl = webcamUrl.trim().replace(/\/+$/, '')
    const formattedUrl =
      cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
        ? cleanUrl
        : `http://${cleanUrl}`

    // Polling engine: 100ms interval (~10 FPS)
    const intervalId = window.setInterval(() => {
      if (!isMountedRef.current || !isStreamingRef.current || isCapturingRef.current) return

      const frameUrl = `${formattedUrl}/shot.jpg?t=${Date.now()}`
      const tempImg = new Image()

      tempImg.onload = () => {
        if (!isMountedRef.current || !isStreamingRef.current || isCapturingRef.current) return

        consecutiveErrorsRef.current = 0
        setIsConnecting(false)
        setHasFirstFrameLoaded(true)
        setError(null)

        if (imgRef.current) {
          imgRef.current.src = frameUrl
        }

        // Live FPS calculation over rolling 1s window
        const now = Date.now()
        frameTimestampsRef.current.push(now)
        frameTimestampsRef.current = frameTimestampsRef.current.filter((t) => now - t <= 1000)
        setFps(frameTimestampsRef.current.length)
      }

      tempImg.onerror = () => {
        if (!isMountedRef.current || !isStreamingRef.current || isCapturingRef.current) return

        consecutiveErrorsRef.current += 1
        if (consecutiveErrorsRef.current >= 10) {
          stopStream()
          setError(
            'Connection failed: 10 consecutive frames failed to load. Ensure mobile IP Webcam app server is active on the same Wi-Fi network.'
          )
        }
      }

      tempImg.src = frameUrl
    }, 100)

    intervalRef.current = intervalId
  }

  const handleCapture = async () => {
    if (!imgRef.current || !canvasRef.current) return

    isCapturingRef.current = true
    stopStream()

    const canvas = canvasRef.current
    const img = imgRef.current

    const width = img.naturalWidth || img.width || 640
    const height = img.naturalHeight || img.height || 480

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    let canvasSuccess = false

    if (ctx) {
      try {
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob && isMountedRef.current) {
            canvasSuccess = true
            isCapturingRef.current = false
            const file = new File([blob], 'webcam-capture.png', { type: 'image/png' })
            const previewUrl = URL.createObjectURL(blob)

            setCapturedFile(file)
            setCapturedPreviewUrl(previewUrl)
            onCapture(file)
          }
        }, 'image/png')
      } catch (err) {
        console.warn('Canvas export failed, attempting direct fetch fallback:', err)
      }
    }

    // Fallback: fetch shot.jpg directly as a File if canvas export was restricted
    setTimeout(async () => {
      if (!canvasSuccess && isMountedRef.current) {
        try {
          const cleanUrl = webcamUrl.trim().replace(/\/+$/, '')
          const formattedUrl =
            cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
              ? cleanUrl
              : `http://${cleanUrl}`

          const res = await fetch(`${formattedUrl}/shot.jpg?t=${Date.now()}`)
          const blob = await res.blob()
          if (!isMountedRef.current) return

          const file = new File([blob], 'webcam-capture.jpg', { type: blob.type || 'image/jpeg' })
          const previewUrl = URL.createObjectURL(blob)

          setCapturedFile(file)
          setCapturedPreviewUrl(previewUrl)
          onCapture(file)
        } catch (fetchErr) {
          console.error('Frame capture fallback error:', fetchErr)
          setError('Failed to extract snapshot from webcam stream. Please try again.')
        } finally {
          isCapturingRef.current = false
        }
      }
    }, 150)
  }

  const handleClearCaptured = () => {
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl)
    }
    setCapturedFile(null)
    setCapturedPreviewUrl(null)
    onClear?.()
  }

  const handleSelectPreset = (preset: string) => {
    if (disabled) return
    setWebcamUrl(preset)
    setError(null)
  }

  return (
    <div className="w-full space-y-4">
      {/* Hidden Canvas for Frame Extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* URL Input & Connect Controls */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-neutral-800">
          IP Webcam Stream Address
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={webcamUrl}
              onChange={(e) => setWebcamUrl(e.target.value)}
              placeholder="http://192.168.0.100:8080"
              disabled={disabled || isStreaming}
              className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:bg-neutral-100 disabled:opacity-75"
            />
            {isStreaming && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE
              </span>
            )}
          </div>

          {isStreaming ? (
            <button
              type="button"
              onClick={stopStream}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-neutral-300 disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-current text-red-600" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startStream}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow disabled:opacity-50"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Connect Stream</span>
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-mono text-neutral-400">Presets:</span>
          {PRESET_URLS.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => handleSelectPreset(url)}
              disabled={disabled || isStreaming}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                webcamUrl === url
                  ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
              } disabled:opacity-50`}
            >
              {url.replace('http://', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Android IP Webcam Setup Guide Collapsible */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50/50">
        <button
          type="button"
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-neutral-700" />
            <span>Android IP Webcam App Setup Instructions</span>
          </div>
          {isGuideOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          )}
        </button>

        {isGuideOpen && (
          <div className="px-3.5 py-3 border-t border-neutral-200 text-xs text-neutral-600 space-y-3 bg-white">
            {/* Network Setup Steps */}
            <div className="space-y-1.5">
              <p className="font-bold text-neutral-900 text-[11px] uppercase tracking-wider">
                1. Network &amp; App Setup:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-neutral-700">
                <li>
                  Install <strong className="text-neutral-900">IP Webcam</strong> app on your Android smartphone from Google Play Store.
                </li>
                <li>
                  Connect your smartphone and this computer to the <strong className="text-neutral-900">same Wi-Fi network</strong> or mobile hotspot.
                </li>
                <li>
                  Open the app, scroll to the bottom, and tap <strong className="text-neutral-900">"Start server"</strong>.
                </li>
                <li>
                  Note the IP address displayed on your phone screen (e.g., <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">http://192.168.137.240:8080</code>).
                </li>
                <li>
                  Enter or click a preset URL above, then click <strong className="text-neutral-900">"Connect Stream"</strong>.
                </li>
              </ol>
            </div>

            {/* Clinical Fundus Imaging Instructions */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-100">
              <p className="font-bold text-neutral-900 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-neutral-800" />
                <span>2. Retinal Fundus Capture Technique:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-neutral-700">
                <li>
                  <strong className="text-neutral-900">Enable LED Flashlight:</strong> In the IP Webcam app video preferences, keep the continuous flashlight ON so light enters the pupil.
                </li>
                <li>
                  <strong className="text-neutral-900">Use Optical Lens / Adapter:</strong> Hold a <strong className="text-neutral-900">20D or 28D ophthalmic condensing lens</strong> 3–5 cm in front of the patient's eye, or clip a smartphone fundus adapter (Peek Retina / MII RetCam).
                </li>
                <li>
                  <strong className="text-neutral-900">Dim Room Lighting:</strong> Conduct screening in a dimly lit room to naturally dilate the patient's pupil.
                </li>
                <li>
                  <strong className="text-neutral-900">Align Optic Nerve Head:</strong> Hold smartphone camera 20–30 cm back until a clear orange/pink circular view of the optic disc appears on the live stream preview.
                </li>
                <li>
                  <strong className="text-neutral-900">Capture &amp; Analyze:</strong> Click <strong className="text-neutral-900">"Capture Frame"</strong> below to freeze the frame and run MultiNet CNN + ANFIS glaucoma analysis!
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Connection Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900 mb-0.5">Stream Error</p>
            <p className="text-[11px] leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Captured Snapshot Display State */}
      {capturedFile && capturedPreviewUrl ? (
        <div className="relative border border-neutral-300 rounded-xl bg-neutral-50 p-4 flex flex-col items-center shadow-sm space-y-3">
          <div className="flex items-center justify-between w-full text-xs font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Camera Snapshot Captured</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-200/60 px-2 py-0.5 rounded">
              PNG format
            </span>
          </div>

          <div className="relative max-h-72 overflow-hidden rounded-lg border border-neutral-200 shadow-sm bg-black/5 flex items-center justify-center w-full">
            <img src={capturedPreviewUrl} alt="Captured Fundus Frame" className="object-contain max-h-64 w-full" />
          </div>

          <div className="flex items-center justify-between w-full text-xs text-neutral-600 px-1">
            <span className="font-mono truncate max-w-[220px] font-semibold">{capturedFile.name}</span>
            <span className="text-neutral-500 font-mono">{(capturedFile.size / 1024).toFixed(1)} KB</span>
          </div>

          <div className="flex items-center gap-2 w-full pt-1">
            <button
              type="button"
              onClick={handleClearCaptured}
              disabled={disabled}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake / Clear Snapshot</span>
            </button>
          </div>
        </div>
      ) : isStreaming ? (
        /* Live Stream Viewport State */
        <div className="space-y-3">
          <div className="relative min-h-[260px] max-h-[340px] border border-neutral-800 rounded-xl bg-black overflow-hidden flex items-center justify-center shadow-inner">
            {/* Live Image Element */}
            <img
              ref={imgRef}
              alt="IP Webcam Live Feed"
              className={`object-contain max-h-[320px] w-full transition-opacity duration-300 ${
                hasFirstFrameLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Connecting Spinner Overlay */}
            {isConnecting && (
              <div className="absolute inset-0 bg-neutral-950/80 flex flex-col items-center justify-center text-white space-y-2 z-10">
                <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-neutral-300">Connecting to IP Webcam stream...</p>
                <p className="text-[10px] font-mono text-neutral-500">{webcamUrl}/shot.jpg</p>
              </div>
            )}

            {/* Overlay Status Badges */}
            {hasFirstFrameLoaded && (
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-900/90 text-white text-[10px] font-mono font-bold border border-neutral-700 shadow">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-900/90 text-emerald-400 text-[10px] font-mono font-bold border border-neutral-700 shadow">
                  {fps} FPS
                </span>
              </div>
            )}
          </div>

          {/* Stream Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCapture}
              disabled={disabled || !hasFirstFrameLoaded}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow hover:shadow-md disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Frame</span>
            </button>

            <button
              type="button"
              onClick={stopStream}
              disabled={disabled}
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold px-3 py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current text-neutral-500" />
              <span>Stop Stream</span>
            </button>
          </div>
        </div>
      ) : (
        /* Standby / Idle State */
        <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white space-y-2">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 mb-1">
            <Camera className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-neutral-900">
            IP Webcam Stream Standby
          </h4>
          <p className="text-[11px] text-neutral-500 max-w-xs leading-relaxed">
            Enter your mobile phone IP address above and click <strong className="text-neutral-700">"Connect Stream"</strong> to view live video feed &amp; capture fundus scans.
          </p>
        </div>
      )}
    </div>
  )
}
