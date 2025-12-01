import { useState } from 'react'
import axios from 'axios'
import http from '../../lib/http/axios'
import { Box, Button, Container, TextField, Typography, Alert, Stack } from '@mui/material'

type OnboardingRequest = {
  userName: string
  userFirstName: string
  userLastName: string
  userEmail: string
}

export default function SubmitPinnedWorkflow() {
  const [form, setForm] = useState<OnboardingRequest>({
    userName: 'donald',
    userFirstName: 'Don',
    userLastName: 'Forbes',
    userEmail: 'donald.forbes@tempporal.io'
  })

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleChange<K extends keyof OnboardingRequest>(key: K, value: string) {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await http.post('/start-onboarding-workflow', form)
      setSuccessMsg('Onboarding workflow started successfully.')
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
        <Typography variant="h4">Submit Pinned Workflow</Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <TextField
          label="User Name"
          value={form.userName}
          onChange={(e) => handleChange('userName', e.target.value)}
          required
        />
        <TextField
          label="First Name"
          value={form.userFirstName}
          onChange={(e) => handleChange('userFirstName', e.target.value)}
          required
        />
        <TextField
          label="Last Name"
          value={form.userLastName}
          onChange={(e) => handleChange('userLastName', e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          value={form.userEmail}
          onChange={(e) => handleChange('userEmail', e.target.value)}
          required
        />

        <Box>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Start Onboarding'}
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}


