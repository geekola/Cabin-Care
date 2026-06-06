import { router } from '../lib/trpc'
import { propertiesRouter } from './properties'
import { checklistsRouter } from './checklists'
import { bookingsRouter } from './bookings'
import { assignmentsRouter } from './assignments'
import { repairItemsRouter } from './repairItems'
import { workOrdersRouter } from './workOrders'
import { staffRouter } from './staff'
import { usersRouter } from './users'

export const appRouter = router({
  users: usersRouter,
  properties: propertiesRouter,
  checklists: checklistsRouter,
  bookings: bookingsRouter,
  assignments: assignmentsRouter,
  repairItems: repairItemsRouter,
  workOrders: workOrdersRouter,
  staff: staffRouter,
})

export type AppRouter = typeof appRouter
