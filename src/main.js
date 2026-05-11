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
// Motion (pre-installed) — animations and scroll effects:
//
//   import { animate, inView, scroll } from 'motion'
//   animate('#hero', { opacity: [0, 1], y: [20, 0] }, { duration: 0.4 })
//   inView('#section', ({ target }) => animate(target, { opacity: [0, 1] }))
//   scroll(animate('#progress', { scaleX: [0, 1] }))
//
// Alpine.js (pre-installed) — reactive UI directly in HTML:
//
//   import Alpine from 'alpinejs'
//   Alpine.start()
//   // Then use x-data, x-show, @click, x-model etc. in index.html
//   // See docs/ui.md → "Reactive UI without a framework"
//
// Lenis (pre-installed) — smooth momentum scrolling:
//
//   import Lenis from 'lenis'
//   const lenis = new Lenis()
//   function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
//   requestAnimationFrame(raf)
//   // See docs/animation.md → "Smooth scroll (Lenis)"
//
// Supabase (pre-installed) — database queries:
//
//   import { supabase } from './supabase.js'
//   const { data, error } = await supabase.from('my_table').select('*')
//   // See docs/data.md → "Supabase database queries"
//
// ─────────────────────────────────────────────
