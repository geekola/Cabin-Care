import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

/**
 * Middleware that enforces a valid Clerk session.
 * Attaches userId to ctx.auth.
 */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, auth: ctx.auth } })
})

export const protectedProcedure = t.procedure.use(enforceAuth)
