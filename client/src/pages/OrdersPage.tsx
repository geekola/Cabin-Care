import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { trpc } from '@/trpc/client'

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  assigned: 'info',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error',
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { data: orders, isLoading, error } = trpc.orders.list.useQuery()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Failed to load orders. Please try again.</Alert>
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disableElevation
          onClick={() => navigate('/orders/new')}
        >
          New Inspection
        </Button>
      </Box>

      {orders?.length === 0 ? (
        <Box
          sx={{
            border: 2,
            borderColor: 'divider',
            borderStyle: 'dashed',
            borderRadius: 2,
            p: 6,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Schedule your first inspection to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disableElevation
            onClick={() => navigate('/orders/new')}
          >
            New Inspection
          </Button>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {orders?.map((order) => (
            <Card key={order.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography fontWeight={600}>{order.property.propertyName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.property.address}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={order.status.replace('_', ' ')}
                      size="small"
                      color={STATUS_COLORS[order.status] ?? 'default'}
                    />
                    <Chip
                      label={order.paymentStatus}
                      size="small"
                      variant="outlined"
                      color={order.paymentStatus === 'paid' ? 'success' : 'default'}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                  {order.orderChecklists.map((oc) => (
                    <Chip key={oc.id} label={oc.checklist.name} size="small" variant="outlined" />
                  ))}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                  <Typography fontWeight={700} color="primary">
                    ${order.totalPrice}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
