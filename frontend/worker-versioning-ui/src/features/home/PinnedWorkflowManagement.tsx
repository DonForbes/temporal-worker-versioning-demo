import { useEffect, useMemo, useRef, useState } from "react";
import { Container, Typography, Stack, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Alert, Button, Box, TextField, FormControlLabel, Switch } from "@mui/material";
import SubmitPinnedWorkflow from "../form/SubmitPinnedWorkflow";
import http from "../../lib/http/axios";

type OnboardingItem = {
  workflowId: string
  startTime: string
  workerVersion: string
  step: string
}

export default function PinnedWorkflowManagement() {
  const [rows, setRows] = useState<OnboardingItem[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<number | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [signingIds, setSigningIds] = useState<Set<string>>(new Set())
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(true)
  const [refreshSeconds, setRefreshSeconds] = useState<number>(3)

  useEffect(() => {
    let stopped = false
    async function tick(initial = false) {
      try {
        if (initial) setLoading(true)
        const res = await http.get<OnboardingItem[]>('/onboarding-workflows')
        if (stopped) return
        setRows(res.data)
        setError(null)
        setLoading(false)
        if (res.data.length === 0) {
          setPollingEnabled(false)
        }
      } catch (e) {
        if (stopped) return
        setError(e instanceof Error ? e.message : 'Failed to fetch onboarding workflows')
        setLoading(false)
      }
    }
    void tick(true)
    if (pollingEnabled) {
      pollingRef.current = window.setInterval(() => void tick(false), Math.max(1, refreshSeconds) * 1000)
    }
    return () => {
      stopped = true
      if (pollingRef.current) window.clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [pollingEnabled, refreshSeconds])

  function shortWorkerVersion(v: string): string {
    const idx = v.lastIndexOf(':')
    return idx >= 0 ? v.slice(idx + 1) : v
  }

  // Deterministic, collision-free color map for visible worker versions
  const versionColorMap = useMemo(() => {
    // More differentiated pale palette (high-contrast, distinct hues)
    const palette = [
      '#dbeafe', // pale blue (preferred 1)
      '#fef9c3', // pale yellow (preferred 2)
      '#fee2e2', // pale red (preferred 3)
      '#ede9fe', // pale violet (preferred 4)
      '#ffedd5', // pale orange (preferred 5)
      '#ecfccb', // pale lime (preferred 6)
      '#e7e5e4', // pale stone (preferred 7)
      '#dcfce7', // pale green (preferred 8)
      // Overflow (less preferred but available if needed)
      '#fce7f3', // pale pink
      '#fff7ed', // pale warm cream
    ]
    const versions = Array.from(new Set((rows ?? []).map(r => r.workerVersion))).sort()
    const map: Record<string, string> = {}
    // Use palette first
    versions.forEach((v, i) => {
      if (i < palette.length) {
        map[v] = palette[i]
      }
    })
    // If more versions than palette, generate extra distinct pale colors
    if (versions.length > palette.length) {
      const extras = versions.slice(palette.length)
      extras.forEach((v, i) => {
        // Use golden-angle step to maximize hue separation
        const hue = Math.round((i * 137.508) % 360)
        map[v] = `hsl(${hue}, 65%, 92%)`
      })
    }
    return map
  }, [rows])

  async function handleSignDocuments(workflowId: string) {
    setActionMsg(null)
    setActionError(null)
    setSigningIds(prev => {
      const next = new Set(prev)
      next.add(workflowId)
      return next
    })
    try {
      await http.post(`/sign-documentation/${encodeURIComponent(workflowId)}`)
      setActionMsg(`Sign request sent for ${workflowId}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send sign request'
      setActionError(msg)
    } finally {
      setSigningIds(prev => {
        const next = new Set(prev)
        next.delete(workflowId)
        return next
      })
    }
  }

  return (
    <Container sx={{ mt: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h3">Pinned Workflow Management</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Refresh (s)"
              type="number"
              size="small"
              inputProps={{ min: 1 }}
              value={refreshSeconds}
              onChange={(e) => {
                const val = Number(e.target.value)
                setRefreshSeconds(Number.isFinite(val) && val > 0 ? val : 1)
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={pollingEnabled}
                  onChange={(_, checked) => setPollingEnabled(checked)}
                />
              }
              label="Auto-refresh"
            />
          </Stack>
        </Stack>
        <Divider />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SubmitPinnedWorkflow />
          </Box>
          <Paper variant="outlined" sx={{ p: 2, maxWidth: 420, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Example Pinned workflow - User Onboarding
            </Typography>
            <Typography variant="body2">
              Using this screen you can start an "onboarding workflow". It will be picked up by 
              a worker that will define the worker version to use. It will remain on this 
              worker version until it completes.  New onboarding workflows can be started any time and 
              will use the latest worker version.
              <br /><br />
              TODO - Add small graphic of the onboarding workflow.
              <br /><br />
              Using the Sign Documents button a signal can be sent to the workflow to progress towards completion.
            </Typography>
          </Paper>
        </Stack>
        <Typography variant="h5">Active Onboarding Workflows</Typography>
        {loading && <LinearProgress />}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundImage: 'linear-gradient(135deg,#182a73 0%, #218aae 69%, #20a7ac 89%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Workflow ID</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Worker Version</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Step</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }} align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rows ?? []).map((r) => (
                <TableRow key={r.workflowId} sx={{ backgroundColor: versionColorMap[r.workerVersion] || '#ffffff' }}>
                  <TableCell>{r.workflowId}</TableCell>
                  <TableCell>{shortWorkerVersion(r.workerVersion)}</TableCell>
                  <TableCell>{r.step}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => void handleSignDocuments(r.workflowId)}
                      disabled={signingIds.has(r.workflowId)}
                    >
                      Sign Documents
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!rows || rows.length === 0) && !loading && !error && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No workflows found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {error && <Alert severity="error">{error}</Alert>}
        {actionMsg && <Alert severity="success" onClose={() => setActionMsg(null)}>{actionMsg}</Alert>}
        {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}
      </Stack>
    </Container>
  )
}


