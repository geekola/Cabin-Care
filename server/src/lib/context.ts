import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { clerkClient } from '@clerk/clerk-sdk-node'

export async function createContext({ req }: CreateExpressContextOptions) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return { auth: null }
  }

  const token = authHeader.slice(7)

  try {
    const payload = await clerkClient.verifyToken(token)
    return { auth: { userId: payload.sub } }
  } catch {
    return { auth: null }
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
