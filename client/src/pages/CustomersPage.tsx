import { useState } from 'react'
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
  TextField,
  Typography,
} from '@mui/material'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { trpc } from '@/trpc/client'
import ListToolbar from '@/components/common/ListToolbar'

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function CustomersPage() {
  const utils = trpc.useUtils()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: customers, isLoading, error } = trpc.staff.listCustomers.useQuery()
  const invite = trpc.staff.invite.useMutation({
    onSuccess: () => {
      setInviteDialog(false)
      setInviteEmail('')
      setInviteSuccess(true)
      setTimeout(() => setInviteSuccess(false), 4000)
    },
  })
  const setStatus = trpc.staff.setStatus.useMutation({
    onSuccess: () => utils.staff.listCustomers.invalidate(),
  })

  const [inviteDialog, setInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [inviteError, setInviteError] = useState('')

  const handleInvite = async () => {
    setInviteError('')
    if (!inviteEmail) {
      setInviteError('Email is required.')
      return
    }
    try {
      await invite.mutateAsync({ email: inviteEmail, role: 'customer' })
    } catch (err: any) {
      setInviteError(err?.message ?? 'Failed to send invite. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Failed to load property owners.</Alert>
  }

  const query = search.trim().toLowerCase()
  const filteredCustomers = (customers ?? []).filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (!query) return true
    return c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
  })

  const activeCustomers = filteredCustomers.filter((c) => c.status === 'active')
  const inactiveCustomers = filteredCustomers.filter((c) => c.status !== 'active')

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <PeopleAltIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Property Owners
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<PersonAddIcon />}
          onClick={() => setInviteDialog(true)}
        >
          Invite Property Owner
        </Button>
      </Box>

      {inviteSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Invitation sent successfully. They'll receive an email with a sign-up link.
        </Alert>
      )}

      {customers?.length === 0 ? (
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
            No property owners yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Invite cabin owners to give them access to their properties and reports.
          </Typography>
          <Button
            variant="contained"
            disableElevation
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteDialog(true)}
          >
            Invite Property Owner
          </Button>
        </Box>
      ) : (
        <>
          <ListToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or email…"
            filters={[
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: STATUS_FILTER_OPTIONS,
              },
            ]}
          />

          {activeCustomers.length === 0 && inactiveCustomers.length === 0 && (
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
                No property owners match your filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different search term or status.
              </Typography>
            </Box>
          )}

          {activeCustomers.length > 0 && (
            <Box mb={4}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Active ({activeCustomers.length})
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {activeCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onDeactivate={() => setStatus.mutate({ userId: customer.id, status: 'inactive' })}
                    loading={setStatus.isPending}
                  />
                ))}
              </Box>
            </Box>
          )}

          {inactiveCustomers.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.secondary">
                Inactive ({inactiveCustomers.length})
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {inactiveCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onActivate={() => setStatus.mutate({ userId: customer.id, status: 'active' })}
                    loading={setStatus.isPending}
                  />
                ))}
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Invite dialog */}
      <Dialog open={inviteDialog} onClose={() => { setInviteDialog(false); setInviteError('') }} fullWidth maxWidth="xs">
        <DialogTitle>Invite Property Owner</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              autoFocus
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
            {inviteError && <Alert severity="error">{inviteError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setInviteDialog(false); setInviteError('') }}>Cancel</Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleInvite}
            disabled={invite.isPending}
          >
            {invite.isPending ? 'Sending…' : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function CustomerCard({
  customer,
  onActivate,
  onDeactivate,
  loading,
}: {
  customer: { id: string; name: string; email: string; status: string; createdAt: Date }
  onActivate?: () => void
  onDeactivate?: () => void
  loading?: boolean
}) {
  const isActive = customer.status === 'active'

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', opacity: isActive ? 1 : 0.65 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box>
            <Typography fontWeight={600}>{customer.name}</Typography>
            <Typography variant="body2" color="text.secondary">{customer.email}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {!isActive && <Chip label="Inactive" size="small" variant="outlined" color="default" />}
            <Divider orientation="vertical" flexItem />
            {isActive ? (
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={onDeactivate}
                disabled={loading}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                size="small"
                color="success"
                variant="outlined"
                onClick={onActivate}
                disabled={loading}
              >
                Activate
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
