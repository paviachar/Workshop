import React from 'react'
import { AlertCircle, ShieldAlert } from 'lucide-react'

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Educational Notice:</strong> ReportSaathi is an educational translation tool and does not provide medical diagnoses or treatment recommendations. Always discuss test results with your licensed healthcare provider.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 text-sm text-blue-950 flex items-start gap-3.5 shadow-xs">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 mt-0.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-blue-900">Important Medical & Educational Disclaimer</h4>
        <p className="text-xs sm:text-sm text-blue-800/90 leading-relaxed">
          ReportSaathi is designed strictly to help patients and families understand laboratory terminology and metrics. It does not replace clinical judgment, offer personalized diagnostic conclusions, or alter treatment regimens. Normal reference intervals can vary by laboratory, instrumentation, and individual factors. Always seek direct medical guidance from a qualified physician.
        </p>
      </div>
    </div>
  )
}
