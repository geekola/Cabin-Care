import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'
import { TRPCError } from '@trpc/server'

export const workOrdersRouter = router({
  // Admin: list all work orders
  list: protectedProcedure.query(async () => {
    return prisma.workOrder.findMany({
      include: {
        repairItem: {
          include: {
            assignment: {
              include: {
                booking: { include: { property: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Admin: create a work order from an approved repair item
  create: protectedProcedure
    .input(z.object({ repairItemId: z.string() }))
    .mutation(async ({ input }) => {
      const repairItem = await prisma.repairItem.findUnique({ where: { id: input.repairItemId } })
      if (!repairItem) throw new TRPCError({ code: 'NOT_FOUND' })
      if (!repairItem.customerApproved) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Repair item has not been approved by the customer.' })
      }
      return prisma.workOrder.create({
        data: { repairItemId: input.repairItemId },
        include: { repairItem: true },
      })
    }),

  // Admin: assign a repair tech to a work order
  assign: protectedProcedure
    .input(z.object({ workOrderId: z.string(), staffId: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.workOrder.update({
        where: { id: input.workOrderId },
        data: { assignedTo: input.staffId, status: 'scheduled' },
      })
    }),

  // Admin / repair_tech: update work order status
  updateStatus: protectedProcedure
    .input(
      z.object({
        workOrderId: z.string(),
        status: z.enum(['pending', 'scheduled', 'in_progress', 'completed']),
        scheduledDate: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.workOrder.update({
        where: { id: input.workOrderId },
        data: {
          status: input.status,
          ...(input.scheduledDate ? { scheduledDate: new Date(input.scheduledDate) } : {}),
        },
      })
    }),

  // Repair tech: list their assigned work orders
  myWorkOrders: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
    return prisma.workOrder.findMany({
      where: { assignedTo: user.id },
      include: {
        repairItem: {
          include: {
            assignment: {
              include: {
                booking: { include: { property: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Admin: list all repair techs (for the assign dropdown)
  listRepairTechs: protectedProcedure.query(async () => {
    return prisma.user.findMany({
      where: { role: 'repair_tech', status: 'active' },
      select: { id: true, name: true, email: true },
    })
  }),
})
