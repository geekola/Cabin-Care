import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'

export const checklistsRouter = router({
  list: publicProcedure.query(() => {
    return prisma.checklist.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    })
  }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    return prisma.checklist.findUniqueOrThrow({
      where: { id: input.id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    })
  }),

  // Admin-only: create/update checklists (add role guard when admin router is wired up)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        description: z.string().optional(),
        basePrice: z.number().positive(),
        estimatedMinutes: z.number().int().positive(),
      }),
    )
    .mutation(({ input }) => {
      return prisma.checklist.create({ data: input })
    }),
})
