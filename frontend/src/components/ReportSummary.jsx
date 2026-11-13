import React from 'react'
import {
  FileText,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react'

export default function ReportSummary({ summary, findings = [], isMockDemo = false }) {
  const { report_title, patient_context, overall_overview, key_highlights } = summary

  const totalCount = findings.length
  const normalCount = findings.filter((f) => (f.status || '').toLowerCase() === 'normal').length
  const flaggedCount = totalCount - normalCount

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Title & Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-700">
              Laboratory Analysis Report
            </span>
            {isMockDemo && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200" title="Using built-in parser. Add GEMINI_API_KEY in backend/.env for live custom AI explanations.">
                Demo Parser Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {report_title}
          </h2>
          {patient_context && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <User className="w-3.5 h-3.5" />
              <span>Context: {patient_context}</span>
            </div>
          )}
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/80 self-start md:self-auto">
          <div className="px-3 py-1 text-center border-r border-slate-200">
            <span className="block text-xs text-slate-500 font-medium">Total</span>
            <span className="text-base font-bold text-slate-900">{totalCount}</span>
          </div>
          <div className="px-3 py-1 text-center border-r border-slate-200">
            <span className="block text-xs text-emerald-600 font-medium">Normal</span>
            <span className="text-base font-bold text-emerald-700">{normalCount}</span>
          </div>
          <div className="px-3 py-1 text-center">
            <span className="block text-xs text-amber-600 font-medium">Flagged</span>
            <span className="text-base font-bold text-amber-700">{flaggedCount}</span>
          </div>
        </div>
      </div>

      {/* Overall Plain-Language Overview */}
      <div className="bg-gradient-to-r from-blue-50/80 via-slate-50/60 to-indigo-50/80 p-5 rounded-2xl border border-blue-100/80">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Patient-Friendly Overview:</span>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
          {overall_overview}
        </p>
      </div>

      {/* Key Highlights Checklist */}
      {key_highlights && key_highlights.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Key Insights
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {key_highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
