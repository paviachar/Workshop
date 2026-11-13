import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your_supabase')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function saveReportToSupabase(user, report) {
  if (!supabase || !user) return null
  try {
    const payload = {
      user_id: user.id,
      report_title: report.summary?.report_title || 'Medical Report',
      patient_context: report.summary?.patient_context || null,
      overall_overview: report.summary?.overall_overview || '',
      key_highlights: report.summary?.key_highlights || [],
      questions_for_doctor: report.summary?.questions_for_doctor || [],
      findings: report.findings || []
    }
    const { data, error } = await supabase.table('reports').insert(payload).select()
    if (error) throw error
    return data ? data[0] : null
  } catch (err) {
    console.error('Failed to save to Supabase:', err)
    return null
  }
}

export async function fetchReportsFromSupabase(user) {
  if (!supabase || !user) return []
  try {
    const { data, error } = await supabase
      .table('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err)
    return []
  }
}
