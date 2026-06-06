import { Box, Button, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function PropertiesPage() {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Properties
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation>
          Add Property
        </Button>
      </Box>
      <Typography color="text.secondary">No properties yet. Add your first one to get started.</Typography>
    </Box>
  )
}
