import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { isAuthConfigured, supabase } from '@/lib/supabase'

export type AuthResult = { ok: true } | { ok: false; message: string }

interface AuthState {
  user: User | null
  session: Session | null
  ready: boolean
  /** Restore any existing session and subscribe to changes. */
  init: () => Promise<void>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

/** Supabase messages are decent, but a few are worth saying plainly. */
function friendly(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('already registered'))
    return 'There is already an account with that email. Try signing in.'
  if (m.includes('invalid login'))
    return 'That email and password do not match an account.'
  if (m.includes('password')) return 'Password must be at least 6 characters.'
  if (m.includes('email')) return 'That does not look like a valid email address.'
  return message
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  ready: !isAuthConfigured, // nothing to wait for when auth is off

  init: async () => {
    if (!supabase) return set({ ready: true })
    const { data } = await supabase.auth.getSession()
    set({ session: data.session, user: data.session?.user ?? null, ready: true })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signUp: async (email, password) => {
    if (!supabase) return { ok: false, message: 'Accounts are not set up yet.' }
    const { error } = await supabase.auth.signUp({ email, password })
    return error ? { ok: false, message: friendly(error.message) } : { ok: true }
  },

  signIn: async (email, password) => {
    if (!supabase) return { ok: false, message: 'Accounts are not set up yet.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { ok: false, message: friendly(error.message) } : { ok: true }
  },

  signOut: async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
