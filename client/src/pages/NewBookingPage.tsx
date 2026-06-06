import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { trpc } from '@/trpc/client'

const STEPS = ['Select Inspections', 'Choose Property', 'Pick Dates', 'Review & Confirm']

export default function NewBookingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<string[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [backupDate, setBackupDate] = useState('')
  const [error, setError] = useState('')

  const { data: checklists, isLoading: loadingChecklists } = trpc.checklists.list.useQuery()
  const { data: properties, isLoading: loadingProperties } = trpc.properties.list.useQuery()
  const createBooking = trpc.bookings.create.useMutation()

  const selectedChecklists = checklists?.filter((c) => selectedChecklistIds.includes(c.id)) ?? []
  const selectedProperty = properties?.find((p) => p.id === propertyId)

  const toggleChecklist = (id: string) => {
    setSelectedChecklistIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const validateStep = () => {
    if (step === 0 && selectedChecklistIds.length === 0) {
      setError('Select at least one inspection.')
      return false
    }
    if (step === 1 && !propertyId) {
      setError('Select a property.')
      return false
    }
    if (step === 2 && !scheduledDate) {
      setError('Choose a preferred date.')
      return false
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    try {
      await createBooking.mutateAsync({
        propertyId,
        checklistIds: selectedChecklistIds,
        scheduledDate: new Date(scheduledDate).toISOString(),
        backupDate: backupDate ? new Date(backupDate).toISOString() : undefined,
      })
      navigate('/bookings')
    } catch {
      setError('Failed to create booking. Please try again.')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Box maxWidth={720} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/bookings')} color="inherit">
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Book Inspection
        </Typography>
      </Box>

      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Select checklists */}
      {step === 0 && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Choose one or more inspections to include in this booking.
          </Typography>
          {loadingChecklists ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {checklists?.map((checklist) => {
                const selected = selectedChecklistIds.includes(checklist.id)
                return (
                  <Grid item xs={12} sm={6} key={checklist.id}>
                    <Card
                      elevation={0}
                      sx={{
                        border: 2,
                        borderColor: selected ? 'primary.main' : 'divider',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <CardActionArea onClick={() => toggleChecklist(checklist.id)}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box flex={1}>
                              <Typography fontWeight={600}>{checklist.name}</Typography>
                              <Chip label={checklist.category} size="small" sx={{ mt: 0.5, mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {checklist.description}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
                                <AccessTimeIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary">
                                  ~{checklist.estimatedMinutes} min
                                </Typography>
                              </Box>
                            </Box>
                            <Checkbox checked={selected} color="primary" />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          )}
          {selectedChecklistIds.length > 0 && (
            <Box mt={2} p={2} bgcolor="primary.50" borderRadius={1} border={1} borderColor="primary.200">
              <Typography fontWeight={600}>
                {selectedChecklistIds.length} inspection{selectedChecklistIds.length > 1 ? 's' : ''} selected
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Step 1: Choose property */}
      {step === 1 && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Which property should be inspected?
          </Typography>
          {loadingProperties ? (
            <CircularProgress />
          ) : properties?.length === 0 ? (
            <Alert severity="warning">
              You don't have any properties yet.{' '}
              <Button size="small" onClick={() => navigate('/properties')}>
                Add a property first
              </Button>
            </Alert>
          ) : (
            <FormControl fullWidth error={!!error && !propertyId}>
              <Select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a property
                </MenuItem>
                {properties?.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.propertyName} — {p.address}
                  </MenuItem>
                ))}
              </Select>
              {!!error && !propertyId && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          )}
        </Box>
      )}

      {/* Step 2: Pick dates */}
      {step === 2 && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Choose your preferred inspection date and an optional backup date.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Preferred Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Backup Date (optional)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: scheduledDate || today }}
                value={backupDate}
                onChange={(e) => setBackupDate(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Review your booking before submitting.
          </Typography>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Property
              </Typography>
              <Typography fontWeight={600}>{selectedProperty?.propertyName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProperty?.address}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Inspections
              </Typography>
              {selectedChecklists.map((c) => (
                <Box key={c.id} display="flex" alignItems="center" gap={1} mb={0.5}>
                  <CheckCircleIcon fontSize="small" color="success" />
                  <Typography variant="body2">{c.name}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Dates
              </Typography>
              <Typography variant="body2">
                Preferred: <strong>{scheduledDate}</strong>
              </Typography>
              {backupDate && (
                <Typography variant="body2">
                  Backup: <strong>{backupDate}</strong>
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Navigation */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button onClick={() => (step === 0 ? navigate('/bookings') : setStep((s) => s - 1))}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="contained" disableElevation onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            disabled={createBooking.isPending}
          >
            {createBooking.isPending ? 'Submitting…' : 'Confirm Booking'}
          </Button>
        )}
      </Box>
    </Box>
  )
}
