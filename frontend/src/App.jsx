import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import DashboardPage from './components/DashboardPage'
import ResultsPage from './components/ResultsPage'
import UploadModal from './components/UploadModal'
import LoadingState from './components/LoadingState'
import AuthModal from './components/AuthModal'
import Footer from './components/Footer'
import { checkHealth, uploadAndAnalyzeReport } from './services/api'
import {
  isSupabaseConfigured,
  getCurrentUser,
  signOut,
  fetchReportsFromSupabase,
  saveReportToSupabase,
  deleteReportFromSupabase,
  supabase
} from './services/supabase'
import { MOCK_REPORTS } from './data/mockReports'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

export default function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'dashboard' | 'results'
  const [reportsList, setReportsList] = useState(MOCK_REPORTS)
  const [selectedReport, setSelectedReport] = useState(MOCK_REPORTS[0])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingReports, setLoadingReports] = useState(false)
  const [loadingFileInfo, setLoadingFileInfo] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [notification, setNotification] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [reportsError, setReportsError] = useState(null)

  // 2. Fetch authenticated user reports
  const loadUserReports = async (user) => {
    if (!user) return
    setLoadingReports(true)
    setReportsError(null)
    try {
      const records = await fetchReportsFromSupabase(user)
      if (records && records.length > 0) {
        const formatted = records.map((rec) => ({
          id: rec.id,
          title: rec.report_title || 'Laboratory Report',
          category: 'Clinical Panel',
          date: new Date(rec.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          patientContext: rec.patient_context || 'Diagnostic Lab Panel',
          labName: 'Verified ReportSaathi Record',
          overallSummary: rec.overall_overview,
          summary: {
            report_title: rec.report_title,
            patient_context: rec.patient_context,
            overall_summary: rec.overall_overview,
            key_highlights: rec.key_highlights || [],
            questions_for_doctor: rec.questions_for_doctor || []
          },
          findings: rec.findings || [],
          doctorQuestions: rec.questions_for_doctor || [],
          isSaved: true,
          saved_to_supabase: true,
          created_at: rec.created_at
        }))
        // Merge user cloud reports with mock reports for richness, user reports first
        setReportsList([...formatted, ...MOCK_REPORTS])
      }
    } catch (err) {
      setReportsError(err.message || 'Failed to load reports from Supabase.')
    } finally {
      setLoadingReports(false)
    }
  }

  // 1. Initial auth state detection
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    getCurrentUser().then((user) => {
      setCurrentUser(user)
      if (user) {
        loadUserReports(user)
      }
    })

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        const user = session?.user || null
        setCurrentUser(user)
        if (user) {
          loadUserReports(user)
        } else {
          // Revert to demo mock reports
          setReportsList(MOCK_REPORTS)
        }
      }
    ) || { data: null }

    return () => {
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  // 3. Navigate to report results
  const handleSelectReport = (report) => {
    setSelectedReport(report)
    setCurrentView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 4. Delete report handler
  const handleDeleteReport = async (reportId) => {
    if (isSupabaseConfigured && currentUser) {
      try {
        await deleteReportFromSupabase(currentUser, reportId)
        setNotification({
          type: 'success',
          text: 'Report successfully deleted from your database.'
        })
      } catch (err) {
        setErrorMessage(`Could not delete from Supabase: ${err.message}`)
      }
    } else {
      setNotification({
        type: 'info',
        text: 'Report removed from local view (Demo mode).'
      })
    }

    setReportsList((prev) => prev.filter((r) => r.id !== reportId))
    if (selectedReport?.id === reportId) {
      setSelectedReport(MOCK_REPORTS[0])
    }
  }

  // 5. Trigger real file upload to FastAPI backend (POST /api/reports/analyze)
  const handleStartLoading = async (file, shouldSave = false) => {
    setIsUploadOpen(false)
    setErrorMessage(null)
    setNotification(null)
    setLoadingFileInfo({
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    })
    setIsLoading(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const responseData = await uploadAndAnalyzeReport(file)

      const reportPayload = {
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
        warnings: responseData.warnings || [],
        isSaved: shouldSave
      }

      // If user enabled saving:
      if (shouldSave) {
        if (isSupabaseConfigured && currentUser) {
          try {
            const savedRecord = await saveReportToSupabase(currentUser, reportPayload)
            if (savedRecord) {
              reportPayload.id = savedRecord.id
              reportPayload.saved_to_supabase = true
              setNotification({
                type: 'success',
                text: 'Report findings successfully saved to your private Supabase database.'
              })
            }
          } catch (saveErr) {
            console.error('Supabase save failed:', saveErr)
            setNotification({
              type: 'error',
              text: `Could not save to Supabase: ${saveErr.message}. Displaying results locally.`
            })
          }
        } else if (!isSupabaseConfigured) {
          // Explicit transparency: Supabase not configured, do not pretend it saved to cloud
          setNotification({
            type: 'info',
            text: 'Supabase credentials not configured. Report is stored in local memory only (Demo Mode).'
          })
        }
      }

      setReportsList((prev) => [reportPayload, ...prev])
      setSelectedReport(reportPayload)
      setIsLoading(false)
      setCurrentView('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setIsLoading(false)
      setErrorMessage(err.message || 'Failed to analyze report through backend API.')
      setCurrentView('dashboard')
    }
  }

  // 6. Synthetic sample preset runner
  const handleSelectSamplePreset = async (presetType, shouldSave = false) => {
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
      handleStartLoading(syntheticFile, shouldSave)
    } catch (e) {
      console.warn('Preset fetch fallback:', e)
      setIsUploadOpen(false)
      setSelectedReport(MOCK_REPORTS[0])
      setCurrentView('results')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setCurrentUser(null)
    setReportsList(MOCK_REPORTS)
    setNotification({
      type: 'info',
      text: 'Signed out. Switched to Demo Mode.'
    })
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
        currentUser={currentUser}
        isCloudConfigured={isSupabaseConfigured}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Ephemeral Notification Banner */}
      {notification && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3">
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-bold mb-0.5">Notice:</strong>
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
          <LoadingState fileInfo={loadingFileInfo} onComplete={() => {}} />
        ) : currentView === 'landing' ? (
          <LandingPage
            onOpenDashboard={() => {
              setCurrentView('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        ) : currentView === 'dashboard' ? (
          <DashboardPage
            reports={reportsList}
            onSelectReport={handleSelectReport}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDeleteReport={handleDeleteReport}
            isCloudConnected={isSupabaseConfigured}
            currentUser={currentUser}
            loadingReports={loadingReports}
            reportsError={reportsError}
          />
        ) : (
          <ResultsPage
            report={selectedReport}
            onBackToDashboard={() => {
              setCurrentView('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onUploadNew={() => setIsUploadOpen(true)}
            onDeleteReport={handleDeleteReport}
            isCloudConnected={isSupabaseConfigured}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Upload Modal with User Choice & Privacy Guarantee */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onStartLoading={handleStartLoading}
        onSelectSamplePreset={handleSelectSamplePreset}
        isCloudConnected={isSupabaseConfigured}
        currentUser={currentUser}
      />

      {/* Auth Modal for Sign In / Sign Up / Setup instructions */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user)
          loadUserReports(user)
        }}
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
