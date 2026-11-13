import React, { useState } from 'react'
import {
  UploadCloud,
  FileText,
  Activity,
  HeartPulse,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  HelpCircle,
  FolderOpen,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Database,
  Cloud,
  HardDrive,
  Loader2,
  AlertCircle
} from 'lucide-react'

export default function DashboardPage({
  reports,
  onSelectReport,
  onOpenUpload,
  onDeleteReport,
  isCloudConnected,
  currentUser,
  loadingReports,
  reportsError
}) {
  const [showEmptyStateDemo, setShowEmptyStateDemo] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const activeReports = showEmptyStateDemo ? [] : reports

  // Total findings across all loaded reports
  const totalFindings = reports.reduce((acc, r) => acc + (r.findings?.length || 0), 0)
  const totalQuestions = reports.reduce((acc, r) => acc + ((r.doctorQuestions || r.questions_for_doctor)?.length || 0), 0)

  const handleDelete = async (e, reportId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this saved report? This action cannot be undone.')) {
      return
    }
    setDeletingId(reportId)
    try {
      await onDeleteReport(reportId)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Greeting */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {isCloudConnected && currentUser ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Sync Active ({currentUser.email})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                <span>Demo Mode (Local / In-Memory)</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Health Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Review your previously translated lab reports, examine individual metrics, and prepare informed questions for your physician.
          </p>
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEmptyStateDemo(!showEmptyStateDemo)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Toggle between populated reports and empty state for evaluation"
          >
            {showEmptyStateDemo ? (
              <>
                <ToggleRight className="w-4 h-4 text-blue-600" />
                <span>Show Reports</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-500" />
                <span>Preview Empty State</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Report</span>
          </button>
        </div>
      </div>

      {/* Reports Error Alert if fetch failed */}
      {reportsError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold">Could not load reports from database</strong>
            <p>{reportsError}</p>
          </div>
        </div>
      )}

      {/* Snapshot Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Available Reports</span>
            <div className="text-2xl font-bold text-slate-900">
              {loadingReports ? '...' : activeReports.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Metrics Explained</span>
            <div className="text-2xl font-bold text-slate-900">
              {loadingReports ? '...' : showEmptyStateDemo ? 0 : totalFindings}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Doctor Questions Ready</span>
            <div className="text-2xl font-bold text-slate-900">
              {loadingReports ? '...' : showEmptyStateDemo ? 0 : totalQuestions}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Upload Card */}
      <div
        onClick={onOpenUpload}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold">Have a new laboratory report?</h3>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-lg">
              Upload PDF, JPG, or PNG files up to 10MB. We’ll extract the values and break down what they mean in plain English.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <span>Choose Report File</span>
          <ArrowRight className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Reports Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Medical Reports</h2>
          <p className="text-xs text-slate-500">
            Click on any report to view its plain-language breakdown, visual indicators, and physician discussion points.
          </p>
        </div>
        {loadingReports && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Syncing reports...</span>
          </div>
        )}
      </div>

      {/* Active Reports List or Empty State */}
      {loadingReports ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">Loading your saved reports...</p>
        </div>
      ) : activeReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeReports.map((report) => {
            const reportFindings = report.findings || report.structured_data || []
            const flaggedCount = reportFindings.filter(
              (f) => (f.status || '').toLowerCase() !== 'normal'
            ).length

            const isSavedDbRecord = Boolean(report.is_saved_to_db || report.id?.toString().includes('-') && report.created_at)

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {report.category || 'Diagnostic Panel'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {report.date || (report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Recent')}
                      </span>
                      {onDeleteReport && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, report.id)}
                          disabled={deletingId === report.id}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete this report"
                        >
                          {deletingId === report.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors mb-1.5 leading-snug">
                    {report.title || report.report_title || 'Medical Report'}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {report.patientContext || report.patient_context || 'Patient Diagnostic Context'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-700">
                      {reportFindings.length} tests
                    </span>
                    {flaggedCount > 0 ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-amber-200">
                        {flaggedCount} outside range
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-200">
                        All in range
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <FolderOpen className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            No Medical Reports Uploaded Yet
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Upload your laboratory report (PDF, JPG, or PNG up to 10MB) to translate clinical values into plain-English explanations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenUpload}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Upload Report File
            </button>
            <button
              onClick={() => setShowEmptyStateDemo(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Load Demo Sample Reports
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
