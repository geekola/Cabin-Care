import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { createContext } from './lib/context'
import { appRouter } from './routers'
import { clerkWebhookHandler } from './middleware/clerkWebhook'
import { sendSeasonalEmails } from './services/seasonalEmail'

const app = express()
const PORT = process.env.PORT ?? 3001

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
