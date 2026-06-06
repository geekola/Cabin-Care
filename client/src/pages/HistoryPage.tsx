import { Box, Typography } from '@mui/material'

export default function HistoryPage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        History
      </Typography>
      <Typography color="text.secondary">Past inspections and reports will appear here.</Typography>
    </Box>
  )
}
