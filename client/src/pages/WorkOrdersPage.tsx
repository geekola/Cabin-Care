import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import EngineeringIcon from '@mui/icons-material/Engineering'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'
import { trpc } from '@/trpc/client'

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  scheduled: 'info',
  in_progress: 'info',
  completed: 'success',
}

export default function WorkOrdersPage() {
  const utils = trpc.useUtils()
  const { data: workOrders, isLoading, error } = trpc.workOrders.list.useQuery()
  const { data: repairItems } = trpc.repairItems.listForOwner.useQuery()
  const { data: techs } = trpc.workOrders.listRepairTechs.useQuery()

  const createWorkOrder = trpc.workOrders.create.useMutation({
    onSuccess: () => {
      utils.workOrders.list.invalidate()
      utils.repairItems.listForOwner.invalidate()
      setCreateDialog(null)
    },
  })
  const assignWorkOrder = trpc.workOrders.assign.useMutation({
    onSuccess: () => {
      utils.workOrders.list.invalidate()
      setAssignDialog(null)
    },
  })
  const updateStatus = trpc.workOrders.updateStatus.useMutation({
    onSuccess: () => utils.workOrders.list.invalidate(),
  })

  const [createDialog, setCreateDialog] = useState<string | null>(null) // repairItemId
  const [assignDialog, setAssignDialog] = useState<{ workOrderId: string; staffId: string } | null>(null)

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }
  if (error) {
    return <Alert severity="error">Failed to load work orders.</Alert>
  }

  // Approved repair items that don't yet have a work order
  const approvedWithoutWorkOrder = (repairItems ?? []).filter(
    (ri) => ri.customerApproved && !ri.workOrder,
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <EngineeringIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Work Orders
          </Typography>
        </Box>
      </Box>

      {/* Approved repairs ready to be turned into work orders */}
      {approvedWithoutWorkOrder.length > 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} mb={1}>
            {approvedWithoutWorkOrder.length} approved repair{approvedWithoutWorkOrder.length > 1 ? 's' : ''} ready for work orders:
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            {approvedWithoutWorkOrder.map((ri) => (
              <Box key={ri.id} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="body2">
                  {ri.assignment.booking.property.propertyName} — {ri.title} (${ri.subtotal.toFixed(2)})
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  disableElevation
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialog(ri.id)}
                >
                  Create Work Order
                </Button>
              </Box>
            ))}
          </Box>
        </Alert>
      )}

      {/* Work order list */}
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
            No work orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Work orders are created from approved repair estimates.
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {workOrders?.map((wo) => {
            const property = wo.repairItem.assignment.booking.property
            const assignedTech = techs?.find((t) => t.id === wo.assignedTo)
            return (
              <Card key={wo.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography fontWeight={600}>{wo.repairItem.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.propertyName} · {property.address}
                      </Typography>
                      {wo.repairItem.description && (
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {wo.repairItem.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={wo.status.replace('_', ' ')}
                      size="small"
                      color={STATUS_COLORS[wo.status] ?? 'default'}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Box display="flex" gap={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Estimate</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary">
                          ${wo.repairItem.subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {assignedTech?.name ?? 'Unassigned'}
                        </Typography>
                      </Box>
                      {wo.scheduledDate && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Scheduled</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(wo.scheduledDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box display="flex" gap={1} flexWrap="wrap">
                      {wo.status !== 'completed' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setAssignDialog({ workOrderId: wo.id, staffId: wo.assignedTo ?? '' })
                          }
                        >
                          {wo.assignedTo ? 'Reassign' : 'Assign Tech'}
                        </Button>
                      )}
                      {wo.status === 'in_progress' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disableElevation
                          onClick={() => updateStatus.mutate({ workOrderId: wo.id, status: 'completed' })}
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

      {/* Create work order dialog */}
      <Dialog open={!!createDialog} onClose={() => setCreateDialog(null)}>
        <DialogTitle>Create Work Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will create a new work order for the approved repair item. You can assign a technician after creation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disableElevation
            disabled={createWorkOrder.isPending}
            onClick={() => createDialog && createWorkOrder.mutate({ repairItemId: createDialog })}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign tech dialog */}
      <Dialog open={!!assignDialog} onClose={() => setAssignDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Assign Technician</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Repair Technician</InputLabel>
            <Select
              label="Repair Technician"
              value={assignDialog?.staffId ?? ''}
              onChange={(e) =>
                setAssignDialog((prev) => prev ? { ...prev, staffId: e.target.value } : null)
              }
            >
              {techs?.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} — {t.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!assignDialog?.staffId || assignWorkOrder.isPending}
            onClick={() =>
              assignDialog &&
              assignWorkOrder.mutate({
                workOrderId: assignDialog.workOrderId,
                staffId: assignDialog.staffId,
              })
            }
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
