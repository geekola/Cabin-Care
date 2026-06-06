import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { trpc } from '@/trpc/client'

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error',
}

export default function AssignmentsPage() {
  const navigate = useNavigate()
  const { data: assignments, isLoading, error } = trpc.assignments.myAssignments.useQuery()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Failed to load assignments. Please try again.</Alert>
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        My Assignments
      </Typography>

      {assignments?.length === 0 ? (
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
            No assignments yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll see your assigned inspections here once they're scheduled.
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {assignments?.map((assignment) => (
            <Card key={assignment.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardActionArea onClick={() => navigate(`/my-assignments/${assignment.id}`)}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography fontWeight={600}>
                        {assignment.booking.property.propertyName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {assignment.booking.property.address}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                        {assignment.booking.bookingChecklists.map((bc) => (
                          <Chip
                            key={bc.checklist.id}
                            label={bc.checklist.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(assignment.booking.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={assignment.status.replace('_', ' ')}
                        size="small"
                        color={STATUS_COLORS[assignment.status] ?? 'default'}
                      />
                      <ChevronRightIcon color="action" />
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
