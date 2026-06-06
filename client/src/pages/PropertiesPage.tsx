import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { trpc } from '@/trpc/client'
import PropertyCard from '@/components/properties/PropertyCard'
import PropertyForm, { type PropertyFormValues } from '@/components/properties/PropertyForm'

type Property = {
  id: string
  propertyName: string
  address: string
  lockboxCode?: string | null
  accessInstructions?: string | null
  notes?: string | null
}

export default function PropertiesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Property | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const utils = trpc.useUtils()
  const { data: properties, isLoading, error } = trpc.properties.list.useQuery()

  const createProperty = trpc.properties.create.useMutation({
    onSuccess: () => utils.properties.list.invalidate(),
  })

  const updateProperty = trpc.properties.update.useMutation({
    onSuccess: () => utils.properties.list.invalidate(),
  })

  const deleteProperty = trpc.properties.delete.useMutation({
    onSuccess: () => utils.properties.list.invalidate(),
  })

  const handleOpenAdd = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (property: Property) => {
    setEditTarget(property)
    setFormOpen(true)
  }

  const handleSubmit = async (values: PropertyFormValues) => {
    if (editTarget) {
      await updateProperty.mutateAsync({ id: editTarget.id, ...values })
    } else {
      await createProperty.mutateAsync(values)
    }
    setFormOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    await deleteProperty.mutateAsync({ id: deleteId })
    setDeleteId(null)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Failed to load properties. Please try again.</Alert>
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Properties
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={handleOpenAdd}>
          Add Property
        </Button>
      </Box>

      {properties?.length === 0 ? (
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
            No properties yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Add your first property to start scheduling inspections.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={handleOpenAdd}>
            Add Property
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {properties?.map((property) => (
            <Grid item xs={12} sm={6} lg={4} key={property.id}>
              <PropertyCard
                property={property}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeleteId(id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add / Edit dialog */}
      <PropertyForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={editTarget ?? undefined}
        title={editTarget ? 'Edit Property' : 'Add Property'}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? This will permanently delete the property and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disableElevation
            onClick={handleDeleteConfirm}
            disabled={deleteProperty.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
