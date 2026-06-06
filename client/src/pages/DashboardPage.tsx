import { useUser } from '@clerk/clerk-react'
import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'

const statCards = [
  { label: 'Properties', value: '—', icon: <HomeWorkIcon fontSize="large" color="primary" /> },
  { label: 'Active Orders', value: '—', icon: <AssignmentIcon fontSize="large" color="warning" /> },
  { label: 'Completed', value: '—', icon: <CheckCircleIcon fontSize="large" color="success" /> },
  { label: 'Pending Approval', value: '—', icon: <PendingIcon fontSize="large" color="error" /> },
]

export default function DashboardPage() {
  const { user } = useUser()
  const firstName = user?.firstName ?? 'there'

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
                  <Typography variant="h4" fontWeight={700}>
                    {card.value}
                  </Typography>
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
