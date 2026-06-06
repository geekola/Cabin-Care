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
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import BuildIcon from '@mui/icons-material/Build'
import { trpc } from '@/trpc/client'

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  declined: 'error',
  completed: 'success',
}

export default function RepairApprovalsPage() {
  const utils = trpc.useUtils()
  const { data: repairItems, isLoading, error } = trpc.repairItems.listForOwner.useQuery()
  const approve = trpc.repairItems.approve.useMutation({
    onSuccess: () => utils.repairItems.listForOwner.invalidate(),
  })
  const decline = trpc.repairItems.decline.useMutation({
    onSuccess: () => utils.repairItems.listForOwner.invalidate(),
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }
  if (error) {
    return <Alert severity="error">Failed to load repair items. Please try again.</Alert>
  }

  const pending = repairItems?.filter((r) => r.status === 'pending') ?? []
  const resolved = repairItems?.filter((r) => r.status !== 'pending') ?? []

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <BuildIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Repair Estimates
        </Typography>
      </Box>

      {repairItems?.length === 0 ? (
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
            No repair items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Repair estimates will appear here when your inspector flags issues.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Pending approval */}
          {pending.length > 0 && (
            <Box mb={4}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Awaiting Your Decision ({pending.length})
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {pending.map((ri) => (
                  <RepairCard
                    key={ri.id}
                    ri={ri}
                    onApprove={() => approve.mutate({ repairItemId: ri.id })}
                    onDecline={() => decline.mutate({ repairItemId: ri.id })}
                    approving={approve.isPending}
                    declining={decline.isPending}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.secondary">
                Resolved
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {resolved.map((ri) => (
                  <RepairCard key={ri.id} ri={ri} />
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

function RepairCard({
  ri,
  onApprove,
  onDecline,
  approving,
  declining,
}: {
  ri: any
  onApprove?: () => void
  onDecline?: () => void
  approving?: boolean
  declining?: boolean
}) {
  const isPending = ri.status === 'pending'

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: isPending ? 'warning.main' : 'divider' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={1}>
          <Box>
            <Typography fontWeight={600}>{ri.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {ri.assignment.booking.property.propertyName} · {ri.assignment.booking.property.address}
            </Typography>
          </Box>
          <Chip
            label={ri.status}
            size="small"
            color={STATUS_COLORS[ri.status] ?? 'default'}
          />
        </Box>

        {ri.description && (
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            {ri.description}
          </Typography>
        )}

        <Box display="flex" gap={3} flexWrap="wrap" mb={isPending ? 2 : 0}>
          {ri.estimatedHours != null && (
            <Box>
              <Typography variant="caption" color="text.secondary">Est. Hours</Typography>
              <Typography variant="body2" fontWeight={600}>{ri.estimatedHours} hrs</Typography>
            </Box>
          )}
          {ri.hourlyRate != null && (
            <Box>
              <Typography variant="caption" color="text.secondary">Hourly Rate</Typography>
              <Typography variant="body2" fontWeight={600}>${ri.hourlyRate}/hr</Typography>
            </Box>
          )}
          {ri.materialCost != null && (
            <Box>
              <Typography variant="caption" color="text.secondary">Materials</Typography>
              <Typography variant="body2" fontWeight={600}>${ri.materialCost}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">Total Estimate</Typography>
            <Typography variant="body2" fontWeight={700} color="primary">${ri.subtotal.toFixed(2)}</Typography>
          </Box>
        </Box>

        {ri.workOrder && (
          <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>
            Work order created — scheduled for{' '}
            {ri.workOrder.scheduledDate
              ? new Date(ri.workOrder.scheduledDate).toLocaleDateString()
              : 'TBD'}
          </Alert>
        )}

        {isPending && onApprove && onDecline && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                disableElevation
                startIcon={<CheckIcon />}
                onClick={onApprove}
                disabled={approving || declining}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CloseIcon />}
                onClick={onDecline}
                disabled={approving || declining}
              >
                Decline
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}
