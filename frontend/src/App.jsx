import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import DashboardPage from './components/DashboardPage'
import ResultsPage from './components/ResultsPage'
import UploadModal from './components/UploadModal'
import LoadingState from './components/LoadingState'
import Footer from './components/Footer'
import { checkHealth, uploadAndAnalyzeReport } from './services/api'
import { MOCK_REPORTS } from './data/mockReports'
import { AlertTriangle } from 'lucide-react'

export default function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'dashboard' | 'results'
  const [reportsList, setReportsList] = useState(MOCK_REPORTS)
  const [selectedReport, setSelectedReport] = useState(MOCK_REPORTS[0])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingFileInfo, setLoadingFileInfo] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [backendHealth, setBackendHealth] = useState(null)

  // Verify backend connectivity on mount
  useEffect(() => {
    checkHealth().then((data) => {
      setBackendHealth(data)
    })
  }, [])

  // Navigate to report results
  const handleSelectReport = (report) => {
    setSelectedReport(report)
    setCurrentView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Trigger real file upload to FastAPI backend (POST /api/reports/analyze)
  const handleStartLoading = async (file) => {
    setIsUploadOpen(false)
    setErrorMessage(null)
    setLoadingFileInfo({
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    })
    setIsLoading(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const responseData = await uploadAndAnalyzeReport(file)

      // Add to local reports list
      const newReportEntry = {
        id: `report-${Date.now()}`,
        title: responseData.summary?.report_title || 'Laboratory Report',
        category: 'Diagnostic Panel',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        patientContext: responseData.summary?.patient_context || 'Clinical Lab Panel',
        labName: 'Processed by ReportSaathi Engine',
        filename: responseData.filename || file.name,
        overallSummary: responseData.summary?.overall_summary,
        summary: responseData.summary,
        findings: responseData.structured_data || responseData.findings || [],
        doctorQuestions: responseData.questions_for_doctor || responseData.summary?.questions_for_doctor || [],
        is_mock_demo: responseData.is_mock_demo,
        model_used: responseData.model_used,
        warnings: responseData.warnings || []
      }

      setReportsList((prev) => [newReportEntry, ...prev])
      setSelectedReport(newReportEntry)
      setIsLoading(false)
      setCurrentView('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setIsLoading(false)
      setErrorMessage(err.message || 'Failed to analyze report through backend API.')
      setCurrentView('dashboard')
    }
  }

  // Synthetic sample preset runner (fetches synthetic sample file from /samples and sends to backend API)
  const handleSelectSamplePreset = async (presetType) => {
    let sampleUrl = '/samples/sample_cbc_report.pdf'
    let sampleName = 'sample_cbc_report.pdf'
    let mimeType = 'application/pdf'

    if (presetType === 'lipid_png') {
      sampleUrl = '/samples/sample_lipid_panel.png'
      sampleName = 'sample_lipid_panel.png'
      mimeType = 'image/png'
    } else if (presetType === 'unclear_missing_range') {
      sampleUrl = '/samples/sample_unclear_report.png'
      sampleName = 'sample_unclear_report.png'
      mimeType = 'image/png'
    }

    try {
      const res = await fetch(sampleUrl)
      if (!res.ok) throw new Error(`Could not load synthetic sample ${sampleUrl}`)
      const blob = await res.blob()
      const syntheticFile = new File([blob], sampleName, { type: mimeType })
      handleStartLoading(syntheticFile)
    } catch (e) {
      console.warn('Preset fetch fallback:', e)
      // Fallback to local mock object if static asset fetch is unavailable
      setIsUploadOpen(false)
      setSelectedReport(MOCK_REPORTS[0])
      setCurrentView('results')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view)
          setErrorMessage(null)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Global Error Banner if API error occurs */}
      {errorMessage && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-bold mb-0.5">Analysis Notice:</strong>
              <p>{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-10 pb-12">
        {isLoading ? (
          /* Real-time Loading State Animation */
          <LoadingState
            fileInfo={loadingFileInfo}
            onComplete={() => {}}
          />
        ) : currentView === 'landing' ? (
          /* Landing Page */
          <LandingPage
            onOpenDashboard={() => {
              setCurrentView('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        ) : currentView === 'dashboard' ? (
          /* Dashboard */
          <DashboardPage
            reports={reportsList}
            onSelectReport={handleSelectReport}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        ) : (
          /* Results Page */
          <ResultsPage
            report={selectedReport}
            onBackToDashboard={() => {
              setCurrentView('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onUploadNew={() => setIsUploadOpen(true)}
          />
        )}
      </main>

      {/* Upload Modal with File & Size Validation */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onStartLoading={handleStartLoading}
        onSelectSamplePreset={handleSelectSamplePreset}
      />

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}
