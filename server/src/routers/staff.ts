import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'
import { clerkClient } from '@clerk/clerk-sdk-node'

export const staffRouter = router({
  // Admin: list all non-customer users
  list: protectedProcedure.query(async () => {
    return prisma.user.findMany({
      where: { role: { not: 'customer' } },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    })
  }),

  // Admin: list all property owner (customer) accounts
  listCustomers: protectedProcedure.query(async () => {
    return prisma.user.findMany({
      where: { role: 'customer' },
      orderBy: [{ name: 'asc' }],
    })
  }),

  // Admin: invite a user by email with a specific role
  invite: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(['customer', 'staff', 'repair_tech', 'admin']),
      }),
    )
    .mutation(async ({ input }) => {
      await clerkClient.invitations.createInvitation({
        emailAddress: input.email,
        redirectUrl: `${process.env.APP_URL ?? ''}/sign-up`,
        publicMetadata: { role: input.role },
        ignoreExisting: true,
      })
      return { ok: true }
    }),

  // Admin: activate or deactivate a staff member
  setStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum(['active', 'inactive']),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.user.update({
        where: { id: input.userId },
        data: { status: input.status },
      })
    }),
})
