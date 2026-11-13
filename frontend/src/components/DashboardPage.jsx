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
  ToggleRight
} from 'lucide-react'

export default function DashboardPage({
  reports,
  onSelectReport,
  onOpenUpload,
  onSimulateSample
}) {
  const [showEmptyStateDemo, setShowEmptyStateDemo] = useState(false)

  const activeReports = showEmptyStateDemo ? [] : reports

  // Total findings across all loaded reports
  const totalFindings = reports.reduce((acc, r) => acc + (r.findings?.length || 0), 0)
  const totalQuestions = reports.reduce((acc, r) => acc + (r.doctorQuestions?.length || 0), 0)

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Greeting */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Educational Demo Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Health Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Review your previously uploaded lab reports, translate new diagnostic documents, and prepare informed questions for your physician.
          </p>
        </div>

        {/* Primary Upload CTA Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEmptyStateDemo(!showEmptyStateDemo)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Toggle between populated reports and empty state for evaluation"
          >
            {showEmptyStateDemo ? (
              <>
                <ToggleRight className="w-4 h-4 text-blue-600" />
                <span>Show Demo Reports</span>
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

      {/* Snapshot Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Available Reports</span>
            <div className="text-2xl font-bold text-slate-900">{activeReports.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Metrics Explained</span>
            <div className="text-2xl font-bold text-slate-900">{showEmptyStateDemo ? 0 : totalFindings}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Doctor Questions Ready</span>
            <div className="text-2xl font-bold text-slate-900">{showEmptyStateDemo ? 0 : totalQuestions}</div>
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
      </div>

      {/* Active Reports List or Empty State */}
      {activeReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeReports.map((report) => {
            const flaggedCount = (report.findings || []).filter(
              (f) => (f.status || '').toLowerCase() !== 'normal'
            ).length

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {report.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {report.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors mb-1.5 leading-snug">
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {report.patientContext} • {report.labName}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-700">
                      {report.findings?.length || 0} tests
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
