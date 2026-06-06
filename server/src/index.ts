import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { createContext } from './lib/context'
import { appRouter } from './routers'
import { clerkWebhookHandler } from './middleware/clerkWebhook'

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
