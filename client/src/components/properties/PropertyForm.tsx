import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'

const schema = z.object({
  propertyName: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  accessInstructions: z.string().optional(),
  lockboxCode: z.string().optional(),
  notes: z.string().optional(),
})

export type PropertyFormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (values: PropertyFormValues) => Promise<void>
  defaultValues?: Partial<PropertyFormValues>
  title?: string
}

export default function PropertyForm({ open, onClose, onSubmit, defaultValues, title = 'Add Property' }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  // Reset form when dialog opens with new defaults
  useEffect(() => {
    if (open) reset(defaultValues ?? {})
  }, [open, defaultValues, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              label="Property Name"
              fullWidth
              {...register('propertyName')}
              error={!!errors.propertyName}
              helperText={errors.propertyName?.message}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              rows={2}
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <TextField
              label="Access Instructions"
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Gate code, parking, entry details"
              {...register('accessInstructions')}
            />
            <TextField
              label="Lockbox Code"
              fullWidth
              {...register('lockboxCode')}
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              {...register('notes')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disableElevation disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
