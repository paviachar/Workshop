import React from 'react'
import { Search, Filter, AlertCircle, CheckCircle, SlidersHorizontal } from 'lucide-react'

export default function FilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search test names (e.g. Hemoglobin, Cholesterol)..."
          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Tests ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('flagged')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeFilter === 'flagged'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Needs Attention ({counts.flagged})</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('normal')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeFilter === 'normal'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Normal ({counts.normal})</span>
        </button>
      </div>
    </div>
  )
}
