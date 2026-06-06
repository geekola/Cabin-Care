import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Chip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import LockIcon from '@mui/icons-material/Lock'
import LocationOnIcon from '@mui/icons-material/LocationOn'

interface Property {
  id: string
  propertyName: string
  address: string
  lockboxCode?: string | null
  accessInstructions?: string | null
  notes?: string | null
}

interface Props {
  property: Property
  onEdit: (property: Property) => void
  onDelete: (id: string) => void
}

export default function PropertyCard({ property, onEdit, onDelete }: Props) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {property.propertyName}
        </Typography>
        <Box display="flex" alignItems="flex-start" gap={0.5} mb={1}>
          <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            {property.address}
          </Typography>
        </Box>
        {property.lockboxCode && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <LockIcon fontSize="small" color="action" />
            <Chip label={`Code: ${property.lockboxCode}`} size="small" variant="outlined" />
          </Box>
        )}
        {property.notes && (
          <Typography variant="body2" color="text.secondary" mt={1} sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {property.notes}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(property)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => onDelete(property.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  )
}
