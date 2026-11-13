import React from 'react'
import { Activity, PlusCircle, LayoutDashboard, Home, Sparkles } from 'lucide-react'

export default function Navbar({ currentView, onNavigate, onOpenUpload }) {
  return (
    <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Return to Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                ReportSaathi
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Educational Demo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Clear & compassionate medical report educator
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentView === 'landing'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>Realistic Sample Data Mode</span>
          </span>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Report</span>
          </button>
        </div>
      </div>
    </header>
  )
}
