import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { Upload, Image as ImageIcon, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { SAMPLE_FUNDUS_IMAGES, sampleImageToFile, type SampleFundusImage } from '../assets/images'

interface ImageUploaderProps {
  onSelectImage: (file: File) => void
  onClear: () => void
  selectedFile: File | null
  disabled?: boolean
}

export function ImageUploader({ onSelectImage, onClear, selectedFile, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid fundus image file (PNG, JPG, JPEG).')
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onSelectImage(file)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleClear = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClear()
  }

  const handleSelectSample = async (sample: SampleFundusImage) => {
    if (disabled) return
    setLoadingSampleId(sample.id)
    try {
      const file = await sampleImageToFile(sample)
      setPreviewUrl(sample.url)
      onSelectImage(file)
    } catch (err) {
      console.error('Failed to load sample image:', err)
      alert('Failed to load sample fundus scan.')
    } finally {
      setLoadingSampleId(null)
    }
  }

  return (
    <div className="w-full space-y-5">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />

      {selectedFile && previewUrl ? (
        <div className="relative border border-neutral-300 rounded-xl bg-neutral-50 p-4 flex flex-col items-center shadow-sm">
          <div className="relative max-h-80 overflow-hidden rounded-lg border border-neutral-200 shadow-sm mb-3 bg-black/5 flex items-center justify-center w-full">
            <img src={previewUrl} alt="Fundus Scan Preview" className="object-contain max-h-72 w-full" />
          </div>
          <div className="flex items-center justify-between w-full text-xs text-neutral-600 px-1">
            <span className="font-mono truncate max-w-[220px] font-semibold">{selectedFile.name}</span>
            <span className="text-neutral-400 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</span>
          </div>
          <button
            onClick={handleClear}
            disabled={disabled}
            className="absolute top-3 right-3 p-1.5 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-full transition-colors shadow"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-neutral-900 bg-neutral-100/50 scale-[1.01]'
              : 'border-neutral-300 hover:border-neutral-500 bg-white hover:bg-neutral-50/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-11 h-11 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-neutral-700" />
          </div>
          <h4 className="text-sm font-semibold text-neutral-900 mb-1">
            Upload Retinal Fundus Image
          </h4>
          <p className="text-xs text-neutral-500 max-w-xs mb-3">
            Drag &amp; drop fundus scan here or click to browse files
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Supports JPG, PNG, TIFF</span>
          </div>
        </div>
      )}

      {/* Sample Fundus Images Quick Selection */}
      <div className="space-y-2 pt-1 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
            <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
            <span>Or test with real research fundus samples:</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase">4 Scans Available</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {SAMPLE_FUNDUS_IMAGES.map((sample) => {
            const isSelected = selectedFile?.name === sample.filename
            const isLoading = loadingSampleId === sample.id

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                disabled={disabled || isLoading}
                className={`group relative text-left p-2 rounded-lg border transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-neutral-800'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-12 h-12 rounded overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0 relative">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {sample.name}
                    </p>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                  </div>
                  <p className={`text-[10px] truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {sample.dataset}
                  </p>
                  <span
                    className={`inline-block text-[9px] font-mono font-semibold px-1 rounded ${
                      isSelected
                        ? 'bg-neutral-800 text-neutral-200'
                        : sample.diagnosis.includes('Glaucoma')
                        ? 'bg-neutral-100 text-neutral-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {sample.diagnosis}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

