/**
 * Vercel serverless function — password checker
 *
 * This runs on the server, so SITE_PASSWORD is never exposed in the browser.
 * Do NOT use a VITE_ prefix here — that would bundle it into the client JS.
 *
 * Set SITE_PASSWORD in your Vercel project's environment variables dashboard.
 * For local development, add SITE_PASSWORD=anything to your .env file
 * (it's in .gitignore so it won't be committed).
 *
 * If you're not using password protection, you can delete this file
 * and remove the gate overlay from index.html.
 */

// In-memory rate limiter. Resets when the serverless instance recycles,
// which is fine for prototyping — it still throttles bursts effectively.
const attempts = new Map() // ip -> { count, lockedUntil }
const MAX_ATTEMPTS  = 5
const LOCKOUT_MS    = 15 * 60 * 1000 // 15 minutes

function getIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const correctPassword = process.env.SITE_PASSWORD

  if (!correctPassword) {
    // No password configured — treat as open access.
    return res.status(200).json({ success: true })
  }

  // Rate limiting — only enforced when a password is configured
  const ip     = getIp(req)
  const now    = Date.now()
  const record = attempts.get(ip) || { count: 0, lockedUntil: 0 }

  if (record.lockedUntil > now) {
    const mins = Math.ceil((record.lockedUntil - now) / 60000)
    return res.status(429).json({
      success: false,
      error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
    })
  }

  const { password } = req.body

  if (password === correctPassword) {
    attempts.delete(ip) // reset on success
    return res.status(200).json({ success: true })
  }

  // Wrong password — record the attempt
  record.count += 1
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS
    record.count = 0
  }
  attempts.set(ip, record)

  return res.status(200).json({ success: false })
}
