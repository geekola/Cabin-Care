import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'

export const assignmentsRouter = router({
  // Staff: get a single assignment with full detail
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.assignment.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          booking: {
            include: {
              property: true,
              bookingChecklists: {
                include: {
                  checklist: {
                    include: { items: { orderBy: { sortOrder: 'asc' } } },
                  },
                },
              },
            },
          },
          results: true,
          repairItems: { include: { workOrder: true } },
        },
      })
    }),

  // Staff: view assigned assignments
  myAssignments: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
    return prisma.assignment.findMany({
      where: { assignedStaffId: user.id },
      include: {
        booking: { include: { property: true, bookingChecklists: { include: { checklist: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Staff: submit inspection results
  submitResults: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        results: z.array(
          z.object({
            checklistItemId: z.string(),
            resultValue: z.string(),
            notes: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      await prisma.assignmentResult.createMany({
        data: input.results.map((r) => ({
          assignmentId: input.assignmentId,
          checklistItemId: r.checklistItemId,
          resultValue: r.resultValue,
          notes: r.notes ?? null,
        })),
        skipDuplicates: true,
      })

      return prisma.assignment.update({
        where: { id: input.assignmentId },
        data: { status: 'completed', completedAt: new Date() },
      })
    }),
})
