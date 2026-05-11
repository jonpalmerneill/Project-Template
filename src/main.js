/**
 * App entry point
 *
 * This is the first JavaScript file that runs. It initializes auth
 * and is where you'll add your own app logic.
 */

import { initAuth } from './auth.js'

// Initialize the password gate.
// On success (or if already authenticated), the gate hides and the app shows.
// To disable password protection, remove this line and delete the gate
// overlay in index.html.
await initAuth()

// ─────────────────────────────────────────────
// Your app logic goes here.
// ─────────────────────────────────────────────
//
// Need animations? Use the motion package:
//
//   import { animate, inView, scroll } from 'motion'
//
//   // Animate an element
//   animate('#hero', { opacity: [0, 1], y: [20, 0] }, { duration: 0.4 })
//
//   // Trigger animation when element enters the viewport
//   inView('#section', ({ target }) => {
//     animate(target, { opacity: [0, 1] }, { duration: 0.5 })
//   })
//
//   // Animate on scroll
//   scroll(animate('#progress', { scaleX: [0, 1] }))
//
// Need the database? Import and use the Supabase client:
//
//   import { supabase } from './supabase.js'
//   const { data, error } = await supabase.from('my_table').select('*')
//   console.log(data)
//
// ─────────────────────────────────────────────
