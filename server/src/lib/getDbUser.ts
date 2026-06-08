import { TRPCError } from '@trpc/server'
import { prisma } from './prisma'

/**
 * Returns the DB user for a Clerk ID, or null if not yet synced.
 * Use for list/read queries — callers should return [] when null.
 */
export async function getDbUser(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } })
}

/**
 * Returns the DB user or throws UNAUTHORIZED.
 * Use for mutations where the user must already exist.
 */
export async function requireDbUser(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User account not ready. Please refresh the page.',
    })
  }
  return user
}
