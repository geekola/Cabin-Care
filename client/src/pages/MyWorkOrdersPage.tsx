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
import EngineeringIcon from '@mui/icons-material/Engineering'
import { trpc } from '@/trpc/client'

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  scheduled: 'info',
  in_progress: 'info',
  completed: 'success',
}

export default function MyWorkOrdersPage() {
  const utils = trpc.useUtils()
  const { data: workOrders, isLoading, error } = trpc.workOrders.myWorkOrders.useQuery()
  const updateStatus = trpc.workOrders.updateStatus.useMutation({
    onSuccess: () => utils.workOrders.myWorkOrders.invalidate(),
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }
  if (error) {
    return <Alert severity="error">Failed to load your work orders.</Alert>
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <EngineeringIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          My Work Orders
        </Typography>
      </Box>

      {workOrders?.length === 0 ? (
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
            No work orders assigned
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll see your assigned repair work here once it's been scheduled.
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {workOrders?.map((wo) => {
            const property = wo.repairItem.assignment.booking.property
            return (
              <Card key={wo.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography fontWeight={600}>{wo.repairItem.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.propertyName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.address}
                      </Typography>
                      {property.accessInstructions && (
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          <strong>Access:</strong> {property.accessInstructions}
                          {property.lockboxCode && <> · <strong>Lockbox:</strong> {property.lockboxCode}</>}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={wo.status.replace('_', ' ')}
                      size="small"
                      color={STATUS_COLORS[wo.status] ?? 'default'}
                    />
                  </Box>

                  {wo.repairItem.description && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {wo.repairItem.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 1.5 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Box display="flex" gap={3}>
                      {wo.scheduledDate && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Scheduled</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(wo.scheduledDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary">Estimate</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary">
                          ${wo.repairItem.subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                      {wo.status === 'scheduled' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            updateStatus.mutate({ workOrderId: wo.id, status: 'in_progress' })
                          }
                          disabled={updateStatus.isPending}
                        >
                          Start Work
                        </Button>
                      )}
                      {wo.status === 'in_progress' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disableElevation
                          onClick={() =>
                            updateStatus.mutate({ workOrderId: wo.id, status: 'completed' })
                          }
                          disabled={updateStatus.isPending}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
