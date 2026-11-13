import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Search,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  Clock,
  Layers,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  ShieldAlert,
  HelpCircle as QuestionIcon,
  Tag
} from 'lucide-react'
import DisclaimerBanner from './DisclaimerBanner'

export default function ResultsPage({ report, onBackToDashboard, onUploadNew }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'flagged' | 'normal'
  const [copiedQuestions, setCopiedQuestions] = useState(false)

  const summary = report?.summary || {}
  const findings = report?.findings || report?.structured_data || []

  // Filter findings based on search and status
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const q = searchQuery.toLowerCase().trim()
      const testName = f.test_name || f.testName || ''
      const explanation = f.simple_explanation || f.plainExplanation || ''
      const matchesSearch =
        !q ||
        testName.toLowerCase().includes(q) ||
        explanation.toLowerCase().includes(q)

      const statusLower = (f.status || '').toLowerCase()
      const isNormal = statusLower === 'normal'
      const isFlagged = !isNormal

      if (activeFilter === 'normal') return matchesSearch && isNormal
      if (activeFilter === 'flagged') return matchesSearch && isFlagged
      return matchesSearch
    })
  }, [findings, searchQuery, activeFilter])

  const totalCount = findings.length
  const normalCount = findings.filter((f) => (f.status || '').toLowerCase() === 'normal').length
  const flaggedCount = totalCount - normalCount

  const doctorQuestions = summary.questions_for_doctor || report.doctorQuestions || []

  const handleCopyQuestions = () => {
    if (!doctorQuestions.length) return
    const text = doctorQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedQuestions(true)
    setTimeout(() => setCopiedQuestions(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 pb-16 print:p-0">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Summary</span>
          </button>

          <button
            onClick={onUploadNew}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow cursor-pointer"
          >
            <span>Upload Another Report</span>
          </button>
        </div>
      </div>

      {/* Prominent Educational Disclaimer Notice (Mandatory Rule) */}
      <DisclaimerBanner />

      {/* Unclear Advisory Warning (if report was degraded, truncated, or had missing ranges) */}
      {(summary.unclear_advisory || summary.is_clarity_sufficient === false) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-amber-950 flex items-start gap-3.5 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">Notice on Report Clarity & Incomplete Data</h4>
            <p className="text-amber-900/90 leading-relaxed">
              {summary.unclear_advisory ||
                "Some reference intervals or clinical values in this report were missing, truncated, or unclear. ReportSaathi does not invent missing data. Please consult a qualified clinician for clinical evaluation."}
            </p>
          </div>
        </div>
      )}

      {/* Executive Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="text-[11px] uppercase font-bold tracking-wider text-blue-700">
                Diagnostic Analysis Summary
              </span>
              {report.model_used && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Model: {report.model_used}
                </span>
              )}
              {report.is_mock_demo && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Local Deterministic Engine
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.report_title || report.title || "Clinical Laboratory Report"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>{summary.patient_context || report.patientContext || "Patient Laboratory Panel"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {report.date || "Analyzed Today"}
              </span>
              {report.filename && (
                <>
                  <span>•</span>
                  <span className="font-mono text-slate-600">{report.filename}</span>
                </>
              )}
            </p>
          </div>

          {/* Quick Metrics Tally */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/80 self-start md:self-auto">
            <div className="px-3.5 py-1 text-center border-r border-slate-200">
              <span className="block text-[11px] text-slate-500 font-medium">Total Tests</span>
              <span className="text-base font-bold text-slate-900">{totalCount}</span>
            </div>
            <div className="px-3.5 py-1 text-center border-r border-slate-200">
              <span className="block text-[11px] text-emerald-600 font-medium">In Range</span>
              <span className="text-base font-bold text-emerald-700">{normalCount}</span>
            </div>
            <div className="px-3.5 py-1 text-center">
              <span className="block text-[11px] text-amber-600 font-medium">Outside Range</span>
              <span className="text-base font-bold text-amber-700">{flaggedCount}</span>
            </div>
          </div>
        </div>

        {/* Overall Synthesis */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-cyan-50/60 p-5 sm:p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Compassionate Educational Overview:</span>
          </div>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {summary.overall_summary || report.overallSummary}
          </p>
        </div>
      </div>

      {/* Questions for Doctor Section */}
      {doctorQuestions && doctorQuestions.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 rounded-3xl border border-indigo-100 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100/80 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Questions to Discuss with Your Doctor
                </h3>
                <p className="text-xs text-slate-500">
                  Prepared to help you have an informed, productive conversation at your appointment
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyQuestions}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              {copiedQuestions ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-600" />
                  <span>Copy Questions Checklist</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {doctorQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 bg-white/90 p-4 rounded-xl border border-indigo-100/60 text-slate-800 text-xs sm:text-sm shadow-2xs"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="font-medium leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Test Findings Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Extracted Values & Educational Explanations
            </h2>
            <p className="text-xs text-slate-500">
              Source-extracted lab facts are clearly distinguished from educational AI explanations.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests (e.g. Hemoglobin, Platelets, Cholesterol)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tests ({totalCount})
            </button>

            <button
              onClick={() => setActiveFilter('flagged')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'flagged'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Outside Reference ({flaggedCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('normal')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'normal'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Within Range ({normalCount})</span>
            </button>
          </div>
        </div>

        {/* Findings Grid */}
        {filteredFindings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredFindings.map((finding, idx) => {
              const testName = finding.test_name || finding.testName || 'Test Parameter'
              const extractedValue = finding.extracted_value || finding.value || 'Reported'
              const unit = finding.unit || ''
              const referenceRange = finding.reference_range || finding.referenceRange || 'Not specified on report'
              const explanation = finding.simple_explanation || finding.plainExplanation || ''
              const sourceFact = finding.source_extracted_fact || `${testName}: ${extractedValue} ${unit}`
              const missingNote = finding.missing_or_unclear_note
              const statusLower = (finding.status || '').toLowerCase()

              let statusConfig = {
                badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                badgeText: 'Within Reference Range',
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
                accentBorder: 'border-l-4 border-l-emerald-500'
              }

              if (statusLower.includes('high')) {
                statusConfig = {
                  badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
                  badgeText: 'Above Reference Range',
                  icon: <ArrowUpCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />,
                  accentBorder: 'border-l-4 border-l-rose-500'
                }
              } else if (statusLower.includes('low')) {
                statusConfig = {
                  badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
                  badgeText: 'Below Reference Range',
                  icon: <ArrowDownCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
                  accentBorder: 'border-l-4 border-l-amber-500'
                }
              } else if (statusLower.includes('borderline')) {
                statusConfig = {
                  badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
                  badgeText: 'Borderline Monitoring',
                  icon: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
                  accentBorder: 'border-l-4 border-l-amber-400'
                }
              } else if (statusLower.includes('unspecified')) {
                statusConfig = {
                  badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
                  badgeText: 'Observed Value',
                  icon: <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />,
                  accentBorder: 'border-l-4 border-l-slate-400'
                }
              }

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4 ${statusConfig.accentBorder}`}
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                          {testName}
                        </h4>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Laboratory Parameter
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.badgeBg}`}
                      >
                        {statusConfig.icon}
                        <span>{statusConfig.badgeText}</span>
                      </span>
                    </div>

                    {/* SECTION 1: SOURCE-EXTRACTED FACTS (Clearly Delineated) */}
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          <FileText className="w-3 h-3 text-slate-600" />
                          <span>Source Report Fact</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                          {sourceFact}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                            Extracted Value
                          </span>
                          <span className="text-xl font-extrabold text-slate-900">
                            {extractedValue}{' '}
                            <span className="text-xs font-semibold text-slate-600">
                              {unit || ''}
                            </span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                            Report Reference Range
                          </span>
                          <span className={`text-xs font-bold ${referenceRange.includes('Not specified') ? 'text-amber-700 italic' : 'text-slate-700'}`}>
                            {referenceRange} {referenceRange.includes('Not specified') ? '' : unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Note on Missing or Unclear Info (Mandatory Rule) */}
                    {missingNote && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-amber-950 font-semibold text-[11px]">
                            Missing / Unclear Note:
                          </strong>
                          <p className="leading-relaxed text-amber-900/90 text-[11px]">
                            {missingNote}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: AI EDUCATIONAL EXPLANATION (Clearly Delineated) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Educational Explanation:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-blue-50/40 p-3 rounded-xl border border-blue-100/60">
                        {explanation}
                      </p>
                    </div>

                    {/* Analogy if available */}
                    {finding.analogy && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-800 font-semibold text-[11px]">
                            Everyday Analogy:
                          </strong>
                          <p className="leading-relaxed text-[11px]">
                            {finding.analogy}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <p className="text-slate-500 text-sm">
              No parameters matched your search ("{searchQuery}").
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveFilter('all')
              }}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Reset search & filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Medical Disclaimer (Mandatory Rule) */}
      <DisclaimerBanner />
    </div>
  )
}
