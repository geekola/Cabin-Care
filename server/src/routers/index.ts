import { router } from '../lib/trpc'
import { propertiesRouter } from './properties'
import { checklistsRouter } from './checklists'
import { ordersRouter } from './orders'
import { jobsRouter } from './jobs'
import { usersRouter } from './users'

export const appRouter = router({
  users: usersRouter,
  properties: propertiesRouter,
  checklists: checklistsRouter,
  orders: ordersRouter,
  jobs: jobsRouter,
})

export type AppRouter = typeof appRouter
