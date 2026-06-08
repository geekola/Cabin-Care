import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'
import { getDbUser, requireDbUser } from '../lib/getDbUser'

export const bookingsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = await getDbUser(ctx.auth.userId)
    if (!user) return []
    return prisma.booking.findMany({
      where: { customerId: user.id },
      include: { property: true, bookingChecklists: { include: { checklist: true } } },
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
      const user = await requireDbUser(ctx.auth.userId)

      const checklists = await prisma.checklist.findMany({
        where: { id: { in: input.checklistIds } },
      })
      const totalPrice = checklists.reduce((sum, c) => sum + c.basePrice, 0)

      return prisma.booking.create({
        data: {
          customerId: user.id,
          propertyId: input.propertyId,
          totalPrice,
          paymentStatus: 'pending',
          status: 'pending',
          scheduledDate: new Date(input.scheduledDate),
          backupDate: input.backupDate ? new Date(input.backupDate) : null,
          bookingChecklists: {
            create: checklists.map((c) => ({ checklistId: c.id, price: c.basePrice })),
          },
        },
        include: { bookingChecklists: true },
      })
    }),
})
