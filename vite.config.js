import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_ prefixed) so SITE_PASSWORD is available
  // to the local API middleware below.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    root: '.',
    build: {
      outDir: 'dist',
    },
    plugins: [
      {
        // Mirrors api/check-password.js for local development.
        // In production, Vercel serves the real serverless function instead.
        name: 'local-api',
        configureServer(server) {
          server.middlewares.use('/api/check-password', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                const { password } = JSON.parse(body)
                const correctPassword = env.SITE_PASSWORD

                res.setHeader('Content-Type', 'application/json')

                if (!correctPassword || password === correctPassword) {
                  res.end(JSON.stringify({ success: true }))
                } else {
                  res.end(JSON.stringify({ success: false }))
                }
              } catch {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Invalid request' }))
              }
            })
          })
        },
      },
    ],
  }
})
