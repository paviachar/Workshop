import React from 'react'
import { CheckCircle, ArrowUpCircle, ArrowDownCircle, AlertCircle, Info } from 'lucide-react'

export default function MetricCard({ finding }) {
  const { test_name, value, unit, reference_range, status, plain_explanation } = finding

  // Color configurations based on status
  const getStatusConfig = () => {
    const s = (status || '').toLowerCase()
    if (s.includes('high')) {
      return {
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeText: 'Higher than reference',
        icon: <ArrowUpCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />,
        accentBorder: 'border-l-4 border-l-rose-500'
      }
    }
    if (s.includes('low')) {
      return {
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeText: 'Lower than reference',
        icon: <ArrowDownCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
        accentBorder: 'border-l-4 border-l-amber-500'
      }
    }
    if (s.includes('borderline')) {
      return {
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeText: 'Borderline',
        icon: <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
        accentBorder: 'border-l-4 border-l-amber-400'
      }
    }
    return {
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeText: 'Within normal range',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
      accentBorder: 'border-l-4 border-l-emerald-500'
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between ${config.accentBorder}`}>
      <div>
        {/* Header: Test Name and Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-base leading-snug">
              {test_name}
            </h4>
            <span className="text-xs text-slate-500">
              Lab Parameter
            </span>
          </div>

          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badgeBg}`}>
            {config.icon}
            <span>{config.badgeText}</span>
          </span>
        </div>

        {/* Value and Reference Range Display */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Your Result
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {value} <span className="text-sm font-semibold text-slate-600">{unit}</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Reference Interval
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {reference_range || 'Not specified'} {unit}
            </span>
          </div>
        </div>

        {/* Plain Language Explanation */}
        <div className="space-y-1 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs mb-1">
            <Info className="w-3.5 h-3.5" />
            <span>Simple Explanation:</span>
          </div>
          <p className="bg-blue-50/40 p-3 rounded-xl border border-blue-100/60 text-slate-700 text-xs sm:text-sm">
            {plain_explanation}
          </p>
        </div>
      </div>
    </div>
  )
}
