import { supabase } from './supabase'

// Sign up with email + password
export async function signUpWithEmail({ email, password, firstName, lastName, role = 'student' }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, role },
    },
  })
  if (error) throw error
  return data
}

// Sign in with email + password
export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Send OTP to phone number
export async function sendPhoneOTP(phone) {
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw error
}

// Verify phone OTP
export async function verifyPhoneOTP(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Get current user profile
export async function getCurrentProfile() {
  const session = await getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*, campus:campuses(*), hostel:hostels(*)')
    .eq('id', session.user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

// Update profile
export async function updateProfile(updates) {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', session.user.id)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}
