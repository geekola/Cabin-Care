import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'

export const usersRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findUnique({
      where: { clerkId: ctx.auth.userId },
    })
  }),

  upsertFromClerk: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.user.upsert({
        where: { clerkId: ctx.auth.userId },
        create: {
          clerkId: ctx.auth.userId,
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          role: 'customer',
          status: 'active',
        },
        update: {
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
        },
      })
    }),
})
