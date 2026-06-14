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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { trpc } from '@/trpc/client'
import ListToolbar from '@/components/common/ListToolbar'

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'warning'> = {
  staff: 'primary',
  repair_tech: 'warning',
  admin: 'secondary',
}

const ROLE_LABELS: Record<string, string> = {
  staff: 'Inspector',
  repair_tech: 'Repair Tech',
  admin: 'Admin',
}

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'staff', label: 'Inspector (Staff)' },
  { value: 'repair_tech', label: 'Repair Tech' },
  { value: 'admin', label: 'Admin' },
]

export default function StaffPage() {
  const utils = trpc.useUtils()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const { data: staffList, isLoading, error } = trpc.staff.list.useQuery()
  const invite = trpc.staff.invite.useMutation({
    onSuccess: () => {
      setInviteDialog(false)
      setInviteForm({ email: '', role: 'staff' })
      setInviteSuccess(true)
      setTimeout(() => setInviteSuccess(false), 4000)
    },
  })
  const setStatus = trpc.staff.setStatus.useMutation({
    onSuccess: () => utils.staff.list.invalidate(),
  })

  const [inviteDialog, setInviteDialog] = useState(false)
  const [inviteForm, setInviteForm] = useState<{ email: string; role: 'staff' | 'repair_tech' | 'admin' }>({
    email: '',
    role: 'staff',
  })
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [inviteError, setInviteError] = useState('')

  const handleInvite = async () => {
    setInviteError('')
    if (!inviteForm.email) {
      setInviteError('Email is required.')
      return
    }
    try {
      await invite.mutateAsync(inviteForm)
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
    return <Alert severity="error">Failed to load staff list.</Alert>
  }

  const query = search.trim().toLowerCase()
  const filteredStaff = (staffList ?? []).filter((s) => {
    if (roleFilter !== 'all' && s.role !== roleFilter) return false
    if (!query) return true
    return s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query)
  })

  const activeStaff = filteredStaff.filter((s) => s.status === 'active')
  const inactiveStaff = filteredStaff.filter((s) => s.status !== 'active')

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <PeopleIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Staff Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<PersonAddIcon />}
          onClick={() => setInviteDialog(true)}
        >
          Invite Staff
        </Button>
      </Box>

      {inviteSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Invitation sent successfully. The staff member will receive an email with a sign-up link.
        </Alert>
      )}

      {/* Active staff */}
      {staffList?.length === 0 ? (
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
            No staff members yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Invite inspectors, repair techs, and admins to get started.
          </Typography>
          <Button
            variant="contained"
            disableElevation
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteDialog(true)}
          >
            Invite Staff
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
                label: 'Role',
                value: roleFilter,
                onChange: setRoleFilter,
                options: ROLE_FILTER_OPTIONS,
              },
            ]}
          />

          {activeStaff.length === 0 && inactiveStaff.length === 0 && (
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
                No staff members match your filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different search term or role.
              </Typography>
            </Box>
          )}

          {activeStaff.length > 0 && (
            <Box mb={4}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Active ({activeStaff.length})
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {activeStaff.map((member) => (
                  <StaffCard
                    key={member.id}
                    member={member}
                    onDeactivate={() => setStatus.mutate({ userId: member.id, status: 'inactive' })}
                    loading={setStatus.isPending}
                  />
                ))}
              </Box>
            </Box>
          )}

          {inactiveStaff.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.secondary">
                Inactive ({inactiveStaff.length})
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {inactiveStaff.map((member) => (
                  <StaffCard
                    key={member.id}
                    member={member}
                    onActivate={() => setStatus.mutate({ userId: member.id, status: 'active' })}
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
        <DialogTitle>Invite Staff Member</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              autoFocus
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm((f) => ({
                    ...f,
                    role: e.target.value as 'staff' | 'repair_tech' | 'admin',
                  }))
                }
              >
                <MenuItem value="staff">Inspector (Staff)</MenuItem>
                <MenuItem value="repair_tech">Repair Technician</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
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

function StaffCard({
  member,
  onActivate,
  onDeactivate,
  loading,
}: {
  member: { id: string; name: string; email: string; role: string; status: string; createdAt: Date }
  onActivate?: () => void
  onDeactivate?: () => void
  loading?: boolean
}) {
  const isActive = member.status === 'active'

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', opacity: isActive ? 1 : 0.65 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box>
            <Typography fontWeight={600}>{member.name}</Typography>
            <Typography variant="body2" color="text.secondary">{member.email}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Chip
              label={ROLE_LABELS[member.role] ?? member.role}
              size="small"
              color={ROLE_COLORS[member.role] ?? 'default'}
            />
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
