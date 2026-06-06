import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'

export const jobsRouter = router({
  // Staff: view assigned jobs
  myJobs: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
    return prisma.job.findMany({
      where: { assignedStaffId: user.id },
      include: {
        order: { include: { property: true, orderChecklists: { include: { checklist: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Staff: submit inspection results
  submitResults: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
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
      await prisma.jobResult.createMany({
        data: input.results.map((r) => ({
          jobId: input.jobId,
          checklistItemId: r.checklistItemId,
          resultValue: r.resultValue,
          notes: r.notes ?? null,
        })),
        skipDuplicates: true,
      })

      return prisma.job.update({
        where: { id: input.jobId },
        data: { status: 'completed', completedAt: new Date() },
      })
    }),
})
