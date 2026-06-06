import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'

export const ordersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
    return prisma.order.findMany({
      where: { customerId: user.id },
      include: { property: true, orderChecklists: { include: { checklist: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }),

  create: protectedProcedure
    .input(
      z.object({
        propertyId: z.string(),
        checklistIds: z.array(z.string()).min(1),
        scheduledDate: z.string().datetime(),
        backupDate: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })

      const checklists = await prisma.checklist.findMany({
        where: { id: { in: input.checklistIds } },
      })
      const totalPrice = checklists.reduce((sum, c) => sum + c.basePrice, 0)

      return prisma.order.create({
        data: {
          customerId: user.id,
          propertyId: input.propertyId,
          totalPrice,
          paymentStatus: 'pending',
          status: 'pending',
          scheduledDate: new Date(input.scheduledDate),
          backupDate: input.backupDate ? new Date(input.backupDate) : null,
          orderChecklists: {
            create: checklists.map((c) => ({ checklistId: c.id, price: c.basePrice })),
          },
        },
        include: { orderChecklists: true },
      })
    }),
})
