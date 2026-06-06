import { Box, Button, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function OrdersPage() {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Orders
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation>
          New Inspection
        </Button>
      </Box>
      <Typography color="text.secondary">No orders yet. Schedule your first inspection to get started.</Typography>
    </Box>
  )
}
