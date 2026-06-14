import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { createContext } from './lib/context'
import { appRouter } from './routers'
import { clerkWebhookHandler } from './middleware/clerkWebhook'
import { sendSeasonalEmails } from './services/seasonalEmail'

const app = express()
const PORT = process.env.PORT ?? 3001

// ---------------------------------------------------------------------------
// CORS
// Allow the deployed frontend (and any Vercel preview deployments), plus
// local dev. Set CLIENT_URL in Railway env vars to add additional origins
// (e.g. a custom domain) without a code change.
// ---------------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://cabin-care-client.vercel.app',
  process.env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin))

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, health checks)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      // Allow any Vercel preview deployment for this project
      if (/^https:\/\/cabin-care-client-[a-z0-9-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true)
      }
      callback(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
  }),
)

// Clerk webhook must receive the raw body for svix signature verification.
// Register BEFORE express.json() so this route gets the raw Buffer.
app.post(
  '/api/webhooks/clerk',
  express.raw({ type: 'application/json' }),
  clerkWebhookHandler,
)

app.use(express.json())

// tRPC handler
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// ---------------------------------------------------------------------------
// Seasonal email cron endpoint
// Call this monthly via Railway's built-in cron or any external scheduler.
// Protect it with CRON_SECRET set in Railway environment variables.
// Cron expression (Railway): 0 9 1 * *  (1st of each month at 09:00 UTC)
// ---------------------------------------------------------------------------
app.post('/api/cron/seasonal-email', async (req, res) => {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers['x-cron-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const result = await sendSeasonalEmails()
    return res.json({ ok: true, ...result })
  } catch (err) {
    console.error('Seasonal email cron failed:', err)
    return res.status(500).json({ error: 'Failed to send seasonal emails' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
