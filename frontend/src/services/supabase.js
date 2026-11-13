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

// Auth methods
export async function signUpWithEmail(email, password, displayName = '') {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName || email.split('@')[0]
      }
    }
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

// User Profile methods
export async function fetchUserProfile(userId) {
  if (!supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Failed to fetch profile:', err)
    return null
  }
}

/**
 * Save report findings to Supabase
 * Strict Privacy Note:
 * Does NOT store uploaded raw report files or raw medical OCR text.
 * Only stores user-consented structured educational findings and summaries.
 */
export async function saveReportToSupabase(user, report) {
  if (!supabase || !user) return null
  try {
    const summary = report.summary || {}
    const payload = {
      user_id: user.id,
      report_title: summary.report_title || report.title || 'Laboratory Report',
      patient_context: summary.patient_context || report.patientContext || null,
      overall_overview: summary.overall_summary || summary.overall_overview || report.overallSummary || '',
      key_highlights: summary.key_highlights || [],
      questions_for_doctor: summary.questions_for_doctor || report.doctorQuestions || [],
      findings: report.findings || report.structured_data || []
    }
    const { data, error } = await supabase.from('reports').insert(payload).select()
    if (error) throw error
    return data ? data[0] : null
  } catch (err) {
    console.error('Failed to save to Supabase:', err)
    throw err
  }
}

export async function fetchReportsFromSupabase(user) {
  if (!supabase || !user) return []
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err)
    throw err
  }
}

export async function deleteReportFromSupabase(user, reportId) {
  if (!supabase || !user) return false
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', user.id)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Failed to delete report from Supabase:', err)
    throw err
  }
}
