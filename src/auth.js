/**
 * Password gate logic
 *
 * Call `await initAuth()` from main.js. It checks sessionStorage first
 * (synchronous, instant). If not authenticated, it probes the API before
 * showing the gate — this prevents a flash of the gate on sites where no
 * password is configured (the gate never appears at all on open sites).
 *
 * The password is validated server-side by /api/check-password.js.
 * It is never stored in the browser bundle.
 *
 * Auth state lives in sessionStorage — it clears when the tab closes.
 * This is intentional for a shared-password site (no persistent login).
 *
 * To disable password protection entirely, remove `await initAuth()` from
 * main.js and delete the gate overlay and its CSS from index.html / style.css.
 */

const AUTH_KEY = 'site_authenticated'

export async function initAuth() {
  const gate = document.getElementById('gate')
  const app  = document.getElementById('app')

  // Fast path: already authenticated this session
  if (sessionStorage.getItem(AUTH_KEY) === 'true') {
    showApp(gate, app)
    return
  }

  // Probe the API before showing the gate.
  // If no SITE_PASSWORD is configured, the server returns success immediately
  // and the gate never appears. If a password is required, the gate shows.
  try {
    const res  = await fetch('/api/check-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '' }),
    })
    const data = await res.json()

    if (data.success) {
      // No password configured — open access
      sessionStorage.setItem(AUTH_KEY, 'true')
      showApp(gate, app)
      return
    }

    // Password required (or rate limited) — show the gate
    gate.removeAttribute('hidden')

    if (res.status === 429 && data.error) {
      // Already locked out — show the message immediately
      const error = document.getElementById('gate-error')
      error.textContent = data.error
      error.hidden = false
    }
  } catch {
    // Network error — show gate as fallback
    gate.removeAttribute('hidden')
  }

  bindForm(gate, app)
}

function bindForm(gate, app) {
  const form   = document.getElementById('gate-form')
  const input  = document.getElementById('gate-input')
  const error  = document.getElementById('gate-error')
  const button = form.querySelector('button[type="submit"]')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    error.hidden = true
    button.disabled = true
    button.textContent = 'Checking…'

    try {
      const res  = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: input.value }),
      })
      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem(AUTH_KEY, 'true')
        showApp(gate, app)
      } else {
        error.textContent = data.error || 'Incorrect password. Try again.'
        error.hidden = false
        input.value = ''
        input.focus()
      }
    } catch {
      error.textContent = 'Something went wrong. Please try again.'
      error.hidden = false
    } finally {
      button.disabled = false
      button.textContent = 'Enter'
    }
  })
}

function showApp(gate, app) {
  gate.setAttribute('hidden', '')
  app.removeAttribute('hidden')
}
