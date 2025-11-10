import { useState } from 'react'
import axios from 'axios'
import http from '../../lib/http/axios'
import { Box, Button, Container, TextField, Typography, Alert, Stack } from '@mui/material'
import type { UnpinnedWorkflowsTest } from '../../lib/types/test-types'
import { useNavigate } from 'react-router-dom'

export default function SubmitUnpinnedWorkflows() {
  const navigate = useNavigate()
  function generateDefaultPrefix(): string {
    const d = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const yy = d.getFullYear().toString().slice(-2)
    const MM = pad(d.getMonth() + 1)
    const DD = pad(d.getDate())
    const HH = pad(d.getHours())
    const mm = pad(d.getMinutes())
    return `${yy}${MM}${DD}-${HH}${mm}`
  }
  const [form, setForm] = useState<UnpinnedWorkflowsTest>({
    testPrefix: generateDefaultPrefix(),
    numberOfWorkflows: 300,
    workflowStartRatePerSecond: 5,
  })

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleChange<K extends keyof UnpinnedWorkflowsTest>(key: K, value: string) {
    setForm(prev => ({
      ...prev,
      [key]: key === 'testPrefix' ? value : Number(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      // Submit the workflows
      await http.post('/start-marketing-workflows', form)
      setSuccessMsg('Workflows submitted successfully.')
      // Navigate to results page for the given prefix
      navigate(`/results/${encodeURIComponent(form.testPrefix)}`)
    } catch (err: unknown) {
      let message = 'Submission failed.'
      if (axios.isAxiosError(err)) {
        const data: unknown = err.response?.data
        const maybeMessage = typeof data === 'object' && data !== null && 'message' in data 
          ? (data as { message?: string }).message 
          : undefined
        message = maybeMessage ?? err.message
      } else if (err instanceof Error) {
        message = err.message
      }
      setErrorMsg(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Stack spacing={2} component="form" onSubmit={handleSubmit}>
        <Typography variant="h4">Submit Unpinned Workflows</Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <TextField
          label="Test Prefix"
          value={form.testPrefix}
          onChange={(e) => handleChange('testPrefix', e.target.value)}
          required
        />

        <TextField
          label="Number of Workflows"
          type="number"
          inputProps={{ min: 1 }}
          value={form.numberOfWorkflows}
          onChange={(e) => handleChange('numberOfWorkflows', e.target.value)}
          required
        />

        <TextField
          label="Workflow Start Rate (per second)"
          type="number"
          inputProps={{ min: 1 }}
          value={form.workflowStartRatePerSecond}
          onChange={(e) => handleChange('workflowStartRatePerSecond', e.target.value)}
          required
        />

        <Box>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}


