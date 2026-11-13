import React, { useState } from 'react'
import { LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle, ShieldCheck, Database } from 'lucide-react'
import { isSupabaseConfigured, signInWithEmail, signUpWithEmail } from '../services/supabase'

export default function AuthModal({ isOpen, onClose, user, onAuthSuccess }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide both email and password.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (mode === 'signup') {
        const data = await signUpWithEmail(email, password)
        setSuccessMsg('Account created successfully! Check your email for verification if required.')
        if (data.user) onAuthSuccess(data.user)
      } else {
        const data = await signInWithEmail(email, password)
        if (data.user) {
          onAuthSuccess(data.user)
          onClose()
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              {isSupabaseConfigured ? 'ReportSaathi Account' : 'Supabase Cloud Sync'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {!isSupabaseConfigured ? (
          /* Notice when Supabase credentials are not yet set */
          <div className="space-y-4">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs sm:text-sm text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-800">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Running in Guest Mode</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                Your report analyses are saved securely in your browser's local storage with zero cloud configuration required.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-800 block">
                To enable optional cloud sync:
              </span>
              <p className="leading-relaxed">
                Add your Supabase credentials in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">frontend/.env</code>:
              </p>
              <pre className="p-2.5 bg-slate-800 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono">
                VITE_SUPABASE_URL=https://xyz.supabase.co{'\n'}
                VITE_SUPABASE_ANON_KEY=eyJ...
              </pre>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Continue in Guest Mode
            </button>
          </div>
        ) : (
          /* Live Supabase Auth Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode switch */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signin' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In to ReportSaathi'
                : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
