import { create } from 'zustand'
import { supabase } from '../services/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  setSession: async (session) => {
    if (!session) {
      set({ user: null, profile: null, session: null, loading: false })
      return
    }
    set({ session, user: session.user })
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, campus:campuses(*), hostel:hostels(*)')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) throw error
      set({ profile: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  refreshProfile: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, campus:campuses(*), hostel:hostels(*)')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) throw error
      set({ profile: data })
    } catch (err) {
      console.error('Failed to refresh profile:', err)
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },

  isRole: (role) => get().profile?.role === role,
}))

export default useAuthStore