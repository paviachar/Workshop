import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCheck,
  AlertTriangle,
  FileCode2,
  Loader2
} from 'lucide-react'
import { SAMPLE_CBC_REPORT, SAMPLE_LIPID_REPORT } from '../services/sampleData'

export default function FileUploader({ onAnalyze, isLoading, error }) {
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'text'
  const [selectedFile, setSelectedFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const fileInputRef = useRef(null)

  const loadingSteps = [
    'Reading report document...',
    'Extracting structured test values via layout & OCR...',
    'Consulting Gemini AI for plain-language explanations...',
    'Finalizing patient-friendly summary...'
  ]

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
    }
  }

  const handleStartAnalysis = async () => {
    if (isLoading) return
    
    // Animate loading step ticker
    setLoadingStep(0)
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
    }, 1400)

    try {
      if (activeTab === 'upload' && selectedFile) {
        await onAnalyze({ file: selectedFile })
      } else if (activeTab === 'text' && rawText.trim()) {
        await onAnalyze({ rawText: rawText.trim() })
      }
    } finally {
      clearInterval(interval)
    }
  }

  const loadSample = (sampleType) => {
    setActiveTab('text')
    if (sampleType === 'cbc') {
      setRawText(SAMPLE_CBC_REPORT)
    } else {
      setRawText(SAMPLE_LIPID_REPORT)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      {/* Mode Tabs */}
      <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl mb-6 max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upload PDF / Image
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Paste Report Text
        </button>
      </div>

      {/* Upload Box */}
      {activeTab === 'upload' ? (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-slate-800 text-base mb-1 truncate max-w-sm">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                </p>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
                  Click to replace file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-slate-800 text-base mb-1">
                  Choose a lab report or drag & drop here
                </h4>
                <p className="text-xs text-slate-500 mb-4 max-w-md">
                  Supports digital PDFs, scanned documents, and photos (PDF, PNG, JPG, WEBP up to 15MB)
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-500" /> PDF Reports
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Lab Photos / Scans
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Text Input Box */
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Paste Report or Lab Values:
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste text from your lab report here e.g. Hemoglobin 11.4 g/dL, Cholesterol 240 mg/dL..."
            rows={8}
            className="w-full text-xs sm:text-sm font-mono p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 resize-y"
          />
        </div>
      )}

      {/* Quick 1-Click Samples for instant testing */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <span className="font-medium text-slate-500">Or try a sample report:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadSample('cbc')}
            className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200/80 transition-colors cursor-pointer"
          >
            Sample CBC Test
          </button>
          <button
            type="button"
            onClick={() => loadSample('lipid')}
            className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200/80 transition-colors cursor-pointer"
          >
            Sample Lipid Profile
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Button & Loading Progress */}
      <div className="mt-6">
        {isLoading ? (
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="font-semibold text-blue-900 text-sm">
                Analyzing Your Lab Report
              </span>
            </div>
            <p className="text-xs text-blue-700 font-medium transition-all">
              {loadingSteps[loadingStep]}
            </p>
            <div className="w-full bg-blue-200/70 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={activeTab === 'upload' ? !selectedFile : !rawText.trim()}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              (activeTab === 'upload' && selectedFile) || (activeTab === 'text' && rawText.trim())
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Explain This Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
