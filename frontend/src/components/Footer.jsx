import React from 'react'
import { Activity, ShieldCheck, Heart } from 'lucide-react'

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-slate-200/90 bg-white py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              ReportSaathi
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">
              • Educational Lab Report Explainer
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <a
              href="#disclaimer"
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Medical Disclaimer
            </a>
          </div>
        </div>

        {/* Legal & Educational Disclaimer Notice */}
        <div className="text-xs text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong>Important Educational Notice:</strong> ReportSaathi is an open educational demonstration platform designed to foster patient health literacy. The information provided is strictly for educational translation of medical terminology and does not constitute medical advice, diagnostic evaluations, or treatment instructions. Laboratory reference intervals vary between diagnostic equipment, clinical laboratories, patient age, and physiological states. Always consult a qualified, licensed healthcare provider regarding test interpretations.
          </p>
          <p className="text-[11px] text-slate-400">
            ReportSaathi Demo Interface • Built with React, Vite, and Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  )
}
