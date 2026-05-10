/**
 * Supabase client
 *
 * This file creates and exports a configured Supabase client.
 * Import it anywhere you need to read from or write to the database:
 *
 *   import { supabase } from './supabase.js'
 *   const { data, error } = await supabase.from('my_table').select('*')
 *
 * WHERE TO GET YOUR KEYS:
 *   1. Go to https://supabase.com and open your project
 *   2. Click Settings → API in the sidebar
 *   3. Copy "Project URL" → VITE_SUPABASE_URL
 *   4. Copy "anon public" key → VITE_SUPABASE_ANON_KEY
 *   5. Paste both into your .env file (copy .env.example first)
 *
 * The anon key is safe to expose in the browser — Supabase uses
 * Row Level Security (RLS) policies to control what it can access.
 *
 * If you're not using Supabase, you can ignore this file entirely.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// ─────────────────────────────────────────────
// USER AUTH — individual accounts
//
// Supabase handles full authentication — no separate service needed.
// Enable providers in: Supabase dashboard → Authentication → Providers
//
// The shared password gate (src/auth.js) and Supabase Auth serve
// different purposes and can be used independently:
//   - Password gate: one shared secret, no accounts, clears on tab close
//   - Supabase Auth: individual accounts, persistent sessions, OAuth
//
// ── Email / password ──────────────────────────
//
//   Sign up:
//   const { data, error } = await supabase.auth.signUp({ email, password })
//
//   Sign in:
//   const { data, error } = await supabase.auth.signInWithPassword({ email, password })
//
// ── OAuth (Google, GitHub, Discord, etc.) ─────
//
//   await supabase.auth.signInWithOAuth({ provider: 'google' })
//   // Redirects the user to the OAuth provider, then back to your site.
//   // Configure redirect URLs in: Supabase dashboard → Authentication → URL Configuration
//
// ── Session & state ───────────────────────────
//
//   Get the current user:
//   const { data: { user } } = await supabase.auth.getUser()
//
//   React to login/logout anywhere in your app:
//   supabase.auth.onAuthStateChange((event, session) => {
//     if (session?.user) { /* user is logged in  */ }
//     else               { /* user is logged out */ }
//   })
//
//   Sign out:
//   await supabase.auth.signOut()
//
// ── Row Level Security (RLS) ──────────────────
//
//   Once users are authenticated, Supabase can restrict database access
//   per-user via RLS policies. Example policy in Supabase SQL editor:
//
//   CREATE POLICY "Users can only see their own rows"
//   ON my_table FOR SELECT
//   USING (auth.uid() = user_id);
//
// ─────────────────────────────────────────────
