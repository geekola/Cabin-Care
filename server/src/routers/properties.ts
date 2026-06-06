import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { prisma } from '../lib/prisma'
import { TRPCError } from '@trpc/server'

export const propertiesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
    return prisma.property.findMany({ where: { ownerId: user.id } })
  }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
    const property = await prisma.property.findUnique({ where: { id: input.id } })
    if (!property || property.ownerId !== user.id) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }
    return property
  }),

  create: protectedProcedure
    .input(
      z.object({
        propertyName: z.string().min(1),
        address: z.string().min(1),
        accessInstructions: z.string().optional(),
        lockboxCode: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
      return prisma.property.create({
        data: { ...input, ownerId: user.id },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        propertyName: z.string().min(1).optional(),
        address: z.string().min(1).optional(),
        accessInstructions: z.string().optional(),
        lockboxCode: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
      const { id, ...data } = input
      const existing = await prisma.property.findUnique({ where: { id } })
      if (!existing || existing.ownerId !== user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return prisma.property.update({ where: { id }, data })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUniqueOrThrow({ where: { clerkId: ctx.auth.userId } })
      const existing = await prisma.property.findUnique({ where: { id: input.id } })
      if (!existing || existing.ownerId !== user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return prisma.property.delete({ where: { id: input.id } })
    }),
})
