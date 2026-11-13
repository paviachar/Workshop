import React, { useState } from 'react'
import { HelpCircle, Copy, Check, MessageSquareHeart } from 'lucide-react'

export default function DoctorQuestions({ questions = [] }) {
  const [copied, setCopied] = useState(false)

  if (!questions || questions.length === 0) return null

  const handleCopy = () => {
    const textToCopy = questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 rounded-3xl border border-indigo-100 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Questions to Ask Your Doctor
            </h3>
            <p className="text-xs text-slate-500">
              Take these discussion points to your next healthcare appointment
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-indigo-600" />
              <span>Copy All Questions</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={index}
            className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-xl border border-indigo-100/60 text-slate-700 text-sm"
          >
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {index + 1}
            </span>
            <p className="font-medium leading-relaxed">{question}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
