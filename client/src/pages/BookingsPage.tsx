import { useState } from 'react'
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
import ListToolbar from '@/components/common/ListToolbar'

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  assigned: 'info',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error',
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function BookingsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: bookings, isLoading, error } = trpc.bookings.list.useQuery()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Failed to load bookings. Please try again.</Alert>
  }

  const query = search.trim().toLowerCase()
  const filteredBookings = (bookings ?? []).filter((booking) => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false
    if (!query) return true
    return (
      booking.property.propertyName.toLowerCase().includes(query) ||
      booking.property.address.toLowerCase().includes(query)
    )
  })

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Bookings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disableElevation
          onClick={() => navigate('/bookings/new')}
        >
          Book Inspection
        </Button>
      </Box>

      {bookings?.length === 0 ? (
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
            No bookings yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Schedule your first inspection to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disableElevation
            onClick={() => navigate('/bookings/new')}
          >
            Book Inspection
          </Button>
        </Box>
      ) : (
        <>
          <ListToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by property name or address…"
            filters={[
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: STATUS_FILTER_OPTIONS,
              },
            ]}
          />

          {filteredBookings.length === 0 ? (
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
                No bookings match your filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different search term or status.
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {filteredBookings.map((booking) => (
                <Card key={booking.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                      <Box>
                        <Typography fontWeight={600}>{booking.property.propertyName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.property.address}
                        </Typography>
                      </Box>
                      <Chip
                        label={booking.status.replace('_', ' ')}
                        size="small"
                        color={STATUS_COLORS[booking.status] ?? 'default'}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                      {booking.bookingChecklists.map((bc) => (
                        <Chip key={bc.id} label={bc.checklist.name} size="small" variant="outlined" />
                      ))}
                    </Box>

                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
