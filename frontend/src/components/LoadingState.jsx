import React, { useState, useEffect } from 'react'
import { Loader2, Sparkles, FileText, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function LoadingState({ fileInfo, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { label: 'Validating document format and resolution...', duration: 700 },
    { label: 'Scanning clinical parameters and reference intervals...', duration: 900 },
    { label: 'Translating diagnostic markers into plain English...', duration: 900 },
    { label: 'Formulating physician discussion checklist...', duration: 700 }
  ]

  useEffect(() => {
    let timeoutId
    if (currentStep < steps.length - 1) {
      timeoutId = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, steps[currentStep].duration)
    } else {
      // Completed all steps
      timeoutId = setTimeout(() => {
        onComplete()
      }, 700)
    }

    return () => clearTimeout(timeoutId)
  }, [currentStep])

  const progressPercentage = Math.round(((currentStep + 1) / steps.length) * 100)

  return (
    <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-lg text-center space-y-6 my-12">
      {/* Animated icon */}
      <div className="relative w-16 h-16 mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cyan-400 text-white flex items-center justify-center text-xs shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Analyzing Your Medical Report
        </h3>
        {fileInfo?.fileName && (
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {fileInfo.fileName} ({fileInfo.fileSize || 'Sample Report'})
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="text-blue-700 font-bold">{steps[currentStep].label}</span>
          <span>{progressPercentage}%</span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps Checklist */}
      <div className="space-y-2 text-left pt-2 border-t border-slate-100">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep
          const isCurrent = idx === currentStep

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs transition-opacity ${
                isDone
                  ? 'text-emerald-700 font-medium'
                  : isCurrent
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : isCurrent ? (
                <span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-200 flex-shrink-0" />
              )}
              <span className="truncate">{step.label}</span>
            </div>
          )
        })}
      </div>

      <div className="pt-2 text-[11px] text-slate-400 italic">
        Educational translation in progress • Never replaces your doctor’s clinical advice
      </div>
    </div>
  )
}
