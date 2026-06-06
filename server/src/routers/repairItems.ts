import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'
import { TRPCError } from '@trpc/server'

export const repairItemsRouter = router({
  // Staff: flag a repair on an assignment
  create: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        estimatedHours: z.number().positive().optional(),
        hourlyRate: z.number().positive().optional(),
        materialCost: z.number().min(0).optional(),
        subtotal: z.number().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.repairItem.create({ data: input })
    }),

  // Staff + customer: list repair items for a specific assignment
  listByAssignment: protectedProcedure
    .input(z.object({ assignmentId: z.string() }))
    .query(async ({ input }) => {
      return prisma.repairItem.findMany({
        where: { assignmentId: input.assignmentId },
        include: { workOrder: true },
        orderBy: { createdAt: 'asc' },
      })
    }),

  // Customer: list all pending repair items across their properties
  listForOwner: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
    return prisma.repairItem.findMany({
      where: {
        assignment: {
          booking: { property: { ownerId: user.id } },
        },
      },
      include: {
        workOrder: true,
        assignment: {
          include: {
            booking: { include: { property: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Customer: approve a repair item
  approve: protectedProcedure
    .input(z.object({ repairItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
      const repairItem = await prisma.repairItem.findUnique({
        where: { id: input.repairItemId },
        include: { assignment: { include: { booking: { include: { property: true } } } } },
      })
      if (!repairItem || repairItem.assignment.booking.property.ownerId !== user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return prisma.repairItem.update({
        where: { id: input.repairItemId },
        data: { status: 'approved', customerApproved: true },
      })
    }),

  // Customer: decline a repair item
  decline: protectedProcedure
    .input(z.object({ repairItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
      const repairItem = await prisma.repairItem.findUnique({
        where: { id: input.repairItemId },
        include: { assignment: { include: { booking: { include: { property: true } } } } },
      })
      if (!repairItem || repairItem.assignment.booking.property.ownerId !== user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return prisma.repairItem.update({
        where: { id: input.repairItemId },
        data: { status: 'declined' },
      })
    }),
})
