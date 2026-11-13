import React from 'react'
import { Activity, PlusCircle, User, LogIn, LogOut, Cloud, HardDrive } from 'lucide-react'

export default function Navbar({
  currentView,
  onNavigate,
  onOpenUpload,
  currentUser,
  isCloudConfigured,
  onOpenAuth,
  onSignOut
}) {
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
        <div className="flex items-center gap-2.5">
          {/* Cloud vs Demo Mode Indicator */}
          {isCloudConfigured ? (
            currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[120px]">{currentUser.email?.split('@')[0]}</span>
                </span>
                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign out of Supabase"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Sign In</span>
              </button>
            )
          ) : (
            <span
              onClick={onOpenAuth}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full font-medium cursor-pointer hover:bg-slate-100 transition-colors"
              title="Click to view Supabase connection setup"
            >
              <HardDrive className="w-3 h-3 text-blue-600" />
              <span>Demo Mode (Local)</span>
            </span>
          )}

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Report</span>
          </button>
        </div>
      </div>
    </header>
  )
}
