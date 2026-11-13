import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  Bug,
  ShieldCheck,
  Check,
  Info
} from 'lucide-react'

export default function UploadModal({
  isOpen,
  onClose,
  onStartLoading,
  onSelectSamplePreset,
  isCloudConnected,
  currentUser
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [shouldSave, setShouldSave] = useState(false) // Strict opt-in: default to false
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']
  const MAX_SIZE_MB = 10
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

  const validateAndSetFile = (file) => {
    setError(null)
    if (!file) return

    // 1. File extension validation
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const isValidType =
      ALLOWED_EXTENSIONS.includes(extension) ||
      file.type === 'application/pdf' ||
      file.type.startsWith('image/')

    if (!isValidType) {
      setError(
        `Unsupported file format (.${extension || 'unknown'}). Please upload a PDF, JPG, or PNG report.`
      )
      setSelectedFile(null)
      return
    }

    // 2. File size validation
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
      setError(
        `File exceeds ${MAX_SIZE_MB}MB limit (selected: ${fileSizeMB} MB). Please choose a smaller document or photo.`
      )
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleAnalyze = () => {
    if (!selectedFile) return
    onStartLoading(selectedFile, shouldSave)
  }

  const handleSimulateError = () => {
    setError('Simulation Error: The uploaded report is corrupted or contains unreadable handwriting. Please upload a clear digital PDF or high-contrast photo.')
    setSelectedFile(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Upload Laboratory Report
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzed via FastAPI backend with Tesseract OCR & Gemini AI (PDF, JPG, PNG up to 10MB)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/40'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <FileCheck className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1 truncate max-w-sm">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
              </p>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                Click to replace file
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-3">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                Drop your report here or click to browse
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mb-3">
                Accepted: <strong className="text-slate-700">.PDF, .JPG, .PNG</strong> (Maximum 10 MB)
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 font-semibold px-3 py-1 rounded-full border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Validated and safely handled on server</span>
              </span>
            </div>
          )}
        </div>

        {/* User Privacy & Opt-in Save Choice */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shouldSave}
              onChange={(e) => setShouldSave(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Save educational summary to report history
              </span>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                {shouldSave ? (
                  isCloudConnected && currentUser ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Will sync to your private Supabase account ({currentUser.email}).
                    </span>
                  ) : (
                    <span className="text-blue-700 font-medium">
                      ✓ Will be saved locally in this browser session. (Demo mode)
                    </span>
                  )
                ) : (
                  <span className="text-slate-500">
                    Unchecked by default. Report will be analyzed and shown in this session without permanent storage.
                  </span>
                )}
              </p>
            </div>
          </label>

          {/* Privacy & Storage Transparency Box */}
          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>ReportSaathi Privacy Guarantee:</span>
            </div>
            <p className="leading-relaxed">
              We <strong>do not store</strong> your uploaded PDF/image files or raw extracted medical OCR text.
              {shouldSave && ' If saving is enabled, only structured educational findings and doctor questions are stored, and you can delete them anytime.'}
            </p>
          </div>
        </div>

        {/* Error Alert State */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold mb-0.5">Upload Notice:</strong>
              <p className="leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-700 font-bold ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Synthetic Sample Reports for 1-Click Verification */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Or test with synthetic sample reports:</span>
            <button
              type="button"
              onClick={handleSimulateError}
              className="text-slate-400 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer"
              title="Test error state handling"
            >
              <Bug className="w-3 h-3" />
              <span>Simulate Error</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onSelectSamplePreset('cbc_pdf', shouldSave)}
              className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold text-left transition-colors cursor-pointer"
            >
              <span className="block font-bold">CBC PDF Report</span>
              <span className="text-[10px] text-blue-600">Scanned PDF fallback</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSamplePreset('lipid_png', shouldSave)}
              className="p-2.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-semibold text-left transition-colors cursor-pointer"
            >
              <span className="block font-bold">Lipid Profile (PNG)</span>
              <span className="text-[10px] text-indigo-600">Image OCR extraction</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSamplePreset('unclear_missing_range', shouldSave)}
              className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-left transition-colors cursor-pointer"
              title="Test with report missing reference ranges to verify strict no-inventing rule"
            >
              <span className="block font-bold">Missing Range Test</span>
              <span className="text-[10px] text-amber-700">Flags missing range</span>
            </button>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedFile
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Process & Explain via Backend API</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
