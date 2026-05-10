/**
 * Password gate logic
 *
 * Call initAuth() from main.js. It checks sessionStorage for a saved
 * auth token. If found, the gate is skipped. If not, the gate overlay
 * is shown and waits for a correct password submission.
 *
 * The password is validated server-side by /api/check-password.js.
 * It is never stored in the browser bundle.
 *
 * Auth state lives in sessionStorage — it clears when the tab closes.
 * This is intentional for a shared-password site (no persistent login).
 *
 * To disable password protection entirely, just don't call initAuth(),
 * or remove the gate overlay from index.html.
 */

const AUTH_KEY = 'site_authenticated'

export function initAuth() {
  const gate = document.getElementById('gate')
  const app = document.getElementById('app')

  // If already authenticated this session, skip the gate
  if (sessionStorage.getItem(AUTH_KEY) === 'true') {
    showApp(gate, app)
    return
  }

  // Otherwise, show the gate and wait for submission
  gate.removeAttribute('hidden')
  app.setAttribute('hidden', '')

  const form = document.getElementById('gate-form')
  const input = document.getElementById('gate-input')
  const error = document.getElementById('gate-error')
  const button = form.querySelector('button[type="submit"]')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    error.hidden = true
    button.disabled = true
    button.textContent = 'Checking…'

    const password = input.value

    try {
      const res = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem(AUTH_KEY, 'true')
        showApp(gate, app)
      } else {
        error.hidden = false
        input.value = ''
        input.focus()
      }
    } catch (err) {
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
