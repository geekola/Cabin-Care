import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import { trpc } from '@/trpc/client'

type ResultMap = Record<string, { resultValue: string; notes: string }>

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const utils = trpc.useUtils()

  const { data: assignment, isLoading, error } = trpc.assignments.byId.useQuery({ id: id! })
  const submitResults = trpc.assignments.submitResults.useMutation({
    onSuccess: () => utils.assignments.byId.invalidate({ id: id! }),
  })
  const createRepairItem = trpc.repairItems.create.useMutation({
    onSuccess: () => {
      setRepairForm(defaultRepairForm)
      setShowRepairForm(false)
      utils.assignments.byId.invalidate({ id: id! })
    },
  })

  const [results, setResults] = useState<ResultMap>({})
  const [submitError, setSubmitError] = useState('')
  const [showRepairForm, setShowRepairForm] = useState(false)
  const defaultRepairForm = {
    title: '',
    description: '',
    estimatedHours: '',
    hourlyRate: '',
    materialCost: '',
  }
  const [repairForm, setRepairForm] = useState(defaultRepairForm)
  const [repairError, setRepairError] = useState('')

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    )
  }
  if (error || !assignment) {
    return <Alert severity="error">Assignment not found.</Alert>
  }

  const allItems = assignment.booking.bookingChecklists.flatMap((bc) =>
    bc.checklist.items.map((item) => ({ ...item, checklistName: bc.checklist.name })),
  )
  const isCompleted = assignment.status === 'completed'
  const submittedIds = new Set(assignment.results.map((r) => r.checklistItemId))

  const setResult = (itemId: string, field: 'resultValue' | 'notes', value: string) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], resultValue: '', notes: '', [field]: value },
    }))
  }

  const handleSubmitResults = async () => {
    const missing = allItems.filter(
      (item) => item.required && !results[item.id]?.resultValue && !submittedIds.has(item.id),
    )
    if (missing.length > 0) {
      setSubmitError(`Complete all required items before submitting.`)
      return
    }
    const toSubmit = allItems
      .filter((item) => !submittedIds.has(item.id) && results[item.id]?.resultValue)
      .map((item) => ({
        checklistItemId: item.id,
        resultValue: results[item.id].resultValue,
        notes: results[item.id].notes || undefined,
      }))
    try {
      await submitResults.mutateAsync({ assignmentId: id!, results: toSubmit })
      setSubmitError('')
    } catch {
      setSubmitError('Failed to submit results. Please try again.')
    }
  }

  const computedSubtotal = () => {
    const hours = parseFloat(repairForm.estimatedHours) || 0
    const rate = parseFloat(repairForm.hourlyRate) || 0
    const materials = parseFloat(repairForm.materialCost) || 0
    return hours * rate + materials
  }

  const handleAddRepair = async () => {
    if (!repairForm.title.trim()) {
      setRepairError('Title is required.')
      return
    }
    setRepairError('')
    await createRepairItem.mutateAsync({
      assignmentId: id!,
      title: repairForm.title,
      description: repairForm.description || undefined,
      estimatedHours: repairForm.estimatedHours ? parseFloat(repairForm.estimatedHours) : undefined,
      hourlyRate: repairForm.hourlyRate ? parseFloat(repairForm.hourlyRate) : undefined,
      materialCost: repairForm.materialCost ? parseFloat(repairForm.materialCost) : undefined,
      subtotal: computedSubtotal(),
    })
  }

  return (
    <Box maxWidth={760} mx="auto">
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/my-assignments')} color="inherit">
          Back
        </Button>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {assignment.booking.property.propertyName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {assignment.booking.property.address}
          </Typography>
        </Box>
        <Chip
          label={assignment.status.replace('_', ' ')}
          color={isCompleted ? 'success' : 'warning'}
        />
      </Box>

      {assignment.booking.property.accessInstructions && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Access:</strong> {assignment.booking.property.accessInstructions}
          {assignment.booking.property.lockboxCode && (
            <> &nbsp;·&nbsp; <strong>Lockbox:</strong> {assignment.booking.property.lockboxCode}</>
          )}
        </Alert>
      )}

      {/* Checklist sections */}
      {assignment.booking.bookingChecklists.map((bc) => (
        <Card key={bc.checklist.id} elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              {bc.checklist.name}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {bc.checklist.items.map((item) => {
                const submitted = submittedIds.has(item.id)
                const submittedResult = assignment.results.find((r) => r.checklistItemId === item.id)
                return (
                  <Box key={item.id}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" fontWeight={500}>
                        {item.itemText}
                        {item.required && (
                          <Typography component="span" color="error" ml={0.5}>*</Typography>
                        )}
                      </Typography>
                      {submitted && <Chip label="Submitted" size="small" color="success" />}
                    </Box>
                    {submitted ? (
                      <Typography variant="body2" color="text.secondary">
                        Result: <strong>{submittedResult?.resultValue}</strong>
                        {submittedResult?.notes && <> — {submittedResult.notes}</>}
                      </Typography>
                    ) : (
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {(item.itemType === 'pass_fail' || item.itemType === 'yes_no') ? (
                          <FormControl size="small" sx={{ minWidth: 140 }} disabled={isCompleted}>
                            <InputLabel>{item.itemType === 'pass_fail' ? 'Pass / Fail' : 'Yes / No'}</InputLabel>
                            <Select
                              label={item.itemType === 'pass_fail' ? 'Pass / Fail' : 'Yes / No'}
                              value={results[item.id]?.resultValue ?? ''}
                              onChange={(e) => setResult(item.id, 'resultValue', e.target.value)}
                            >
                              {item.itemType === 'pass_fail' ? (
                                <>
                                  <MenuItem value="pass">Pass</MenuItem>
                                  <MenuItem value="fail">Fail</MenuItem>
                                </>
                              ) : (
                                <>
                                  <MenuItem value="yes">Yes</MenuItem>
                                  <MenuItem value="no">No</MenuItem>
                                </>
                              )}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            size="small"
                            label={item.itemType === 'number' ? 'Value' : item.itemType === 'photo' ? 'Photo URL' : 'Notes'}
                            value={results[item.id]?.resultValue ?? ''}
                            onChange={(e) => setResult(item.id, 'resultValue', e.target.value)}
                            disabled={isCompleted}
                            sx={{ minWidth: 200 }}
                          />
                        )}
                        <TextField
                          size="small"
                          label="Notes (optional)"
                          value={results[item.id]?.notes ?? ''}
                          onChange={(e) => setResult(item.id, 'notes', e.target.value)}
                          disabled={isCompleted}
                          sx={{ flex: 1, minWidth: 160 }}
                        />
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Submit results */}
      {!isCompleted && (
        <Box mb={3}>
          {submitError && <Alert severity="error" sx={{ mb: 1 }}>{submitError}</Alert>}
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmitResults}
            disabled={submitResults.isPending}
          >
            {submitResults.isPending ? 'Submitting…' : 'Submit Inspection Results'}
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Repair items */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Repair Items
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={() => setShowRepairForm((v) => !v)}
          >
            Flag Repair
          </Button>
        </Box>

        <Collapse in={showRepairForm}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'primary.main', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>
                <BuildIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                New Repair Item
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Title"
                  required
                  fullWidth
                  size="small"
                  value={repairForm.title}
                  onChange={(e) => setRepairForm((f) => ({ ...f, title: e.target.value }))}
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={repairForm.description}
                  onChange={(e) => setRepairForm((f) => ({ ...f, description: e.target.value }))}
                />
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="Est. Hours"
                    type="number"
                    size="small"
                    sx={{ flex: 1, minWidth: 120 }}
                    value={repairForm.estimatedHours}
                    onChange={(e) => setRepairForm((f) => ({ ...f, estimatedHours: e.target.value }))}
                    inputProps={{ min: 0, step: 0.5 }}
                  />
                  <TextField
                    label="Hourly Rate ($)"
                    type="number"
                    size="small"
                    sx={{ flex: 1, minWidth: 120 }}
                    value={repairForm.hourlyRate}
                    onChange={(e) => setRepairForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    label="Materials ($)"
                    type="number"
                    size="small"
                    sx={{ flex: 1, minWidth: 120 }}
                    value={repairForm.materialCost}
                    onChange={(e) => setRepairForm((f) => ({ ...f, materialCost: e.target.value }))}
                    inputProps={{ min: 0 }}
                  />
                </Box>
                {(repairForm.estimatedHours || repairForm.materialCost) && (
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    Estimated Total: ${computedSubtotal().toFixed(2)}
                  </Typography>
                )}
                {repairError && <Alert severity="error">{repairError}</Alert>}
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={handleAddRepair}
                    disabled={createRepairItem.isPending}
                  >
                    {createRepairItem.isPending ? 'Adding…' : 'Add Repair Item'}
                  </Button>
                  <Button onClick={() => { setShowRepairForm(false); setRepairError('') }}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {assignment.repairItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No repair items flagged.
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={1.5}>
            {assignment.repairItems.map((ri) => (
              <Card key={ri.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography fontWeight={600}>{ri.title}</Typography>
                      {ri.description && (
                        <Typography variant="body2" color="text.secondary">{ri.description}</Typography>
                      )}
                      <Typography variant="body2" color="primary" fontWeight={600} mt={0.5}>
                        ${ri.subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Chip
                      label={ri.status}
                      size="small"
                      color={
                        ri.status === 'approved' ? 'success' :
                        ri.status === 'declined' ? 'error' : 'default'
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
