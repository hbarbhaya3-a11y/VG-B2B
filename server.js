import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import compression from 'compression'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8080

// ── Security headers ────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; frame-ancestors 'self'")
  next()
})

// ── Gzip compression ────────────────────────────────────────────────
app.use(compression())

// ── OpenAI API proxy (key injected server-side) ─────────────────────
const LLM_API_KEY = process.env.LLM_API_KEY || ''

if (LLM_API_KEY) {
  app.use('/api/openai', createProxyMiddleware({
    target: 'https://api.openai.com',
    changeOrigin: true,
    pathRewrite: { '^/api/openai': '' },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('Authorization', `Bearer ${LLM_API_KEY}`)
    },
  }))
} else {
  app.use('/api/openai', (req, res) => {
    res.status(503).json({ error: 'LLM_API_KEY not configured on server' })
  })
}

// ── Static files (Vite build output) ────────────────────────────────
const distDir = join(__dirname, 'dist')

app.use(express.static(distDir, {
  maxAge: '1y',
  immutable: true,
  index: false,
}))

// ── SPA fallback (compatible with Express v4 and v5) ────────────────
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.sendFile(join(distDir, 'index.html'))
})

// ── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`)
  console.log(`[server] LLM proxy: ${LLM_API_KEY ? 'enabled' : 'DISABLED (no LLM_API_KEY)'}`)
})
