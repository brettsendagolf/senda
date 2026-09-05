import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client, built from environment variables.
 *
 * The anon key is designed to be shipped in a browser bundle — it is not a
 * secret. What protects the data is Row Level Security on the server, which
 * must be switched on for every table before any user data is stored.
 *
 * Both values live in .env.local (gitignored). When they are missing the app
 * still runs: auth is simply unavailable and onboarding skips the account
 * step, so a half-configured build never blocks practice.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isAuthConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // The session lives in localStorage so a phone reload stays signed in.
        storageKey: 'senda-auth',
      },
    })
  : null

if (!isAuthConfigured && import.meta.env.DEV) {
  console.info(
    'Supabase not configured — accounts are off. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local to enable them.',
  )
}
