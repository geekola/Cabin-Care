import { useUser } from '@clerk/clerk-react'
import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import { trpc } from '@/trpc/client'

const ACTIVE_BOOKING_STATUSES = new Set(['pending', 'confirmed', 'assigned', 'in_progress'])

export default function DashboardPage() {
  const { user } = useUser()
  const firstName = user?.firstName ?? 'there'

  const { data: properties, isLoading: propertiesLoading } = trpc.properties.list.useQuery()
  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.list.useQuery()
  const { data: repairItems, isLoading: repairsLoading } = trpc.repairItems.listForOwner.useQuery()

  const activeOrders = bookings?.filter((b) => ACTIVE_BOOKING_STATUSES.has(b.status)).length ?? 0
  const completedOrders = bookings?.filter((b) => b.status === 'completed').length ?? 0
  const pendingApprovals = repairItems?.filter((r) => r.status === 'pending').length ?? 0

  const statCards = [
    {
      label: 'Properties',
      value: properties?.length ?? 0,
      loading: propertiesLoading,
      icon: <HomeWorkIcon fontSize="large" color="primary" />,
    },
    {
      label: 'Active Orders',
      value: activeOrders,
      loading: bookingsLoading,
      icon: <AssignmentIcon fontSize="large" color="warning" />,
    },
    {
      label: 'Completed',
      value: completedOrders,
      loading: bookingsLoading,
      icon: <CheckCircleIcon fontSize="large" color="success" />,
    },
    {
      label: 'Pending Approval',
      value: pendingApprovals,
      loading: repairsLoading,
      icon: <PendingIcon fontSize="large" color="error" />,
    },
  ]

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Welcome back, {firstName}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Here's an overview of your properties and inspections.
      </Typography>

      <Grid container spacing={2}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {card.icon}
                <Box>
                  {card.loading ? (
                    <Skeleton variant="text" width={32} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>
                      {card.value}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
