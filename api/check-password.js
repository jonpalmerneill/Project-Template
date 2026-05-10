/**
 * Vercel serverless function — password checker
 *
 * This runs on the server, so SITE_PASSWORD is never exposed in the browser.
 * Do NOT use a VITE_ prefix here — that would bundle it into the client JS.
 *
 * Set SITE_PASSWORD in your Vercel project's environment variables dashboard.
 * Do not put it in your .env file (that's for local dev only and not committed).
 *
 * For local development, you can create a .env file with:
 *   SITE_PASSWORD=your_local_test_password
 * (it's in .gitignore so it won't be committed)
 *
 * If you're not using password protection, you can delete this file
 * and remove the gate overlay from index.html.
 */

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body
  const correctPassword = process.env.SITE_PASSWORD

  if (!correctPassword) {
    // No password set — treat as open access.
    // Remove this block and return { success: false } if you want
    // to enforce that a password must be configured.
    return res.status(200).json({ success: true })
  }

  if (password === correctPassword) {
    return res.status(200).json({ success: true })
  }

  return res.status(200).json({ success: false })
}
