import { useEffect, useRef, useState } from "react";
import { Container, Typography, Stack, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Alert } from "@mui/material";
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
      } catch (e) {
        if (stopped) return
        setError(e instanceof Error ? e.message : 'Failed to fetch onboarding workflows')
        setLoading(false)
      }
    }
    void tick(true)
    pollingRef.current = window.setInterval(() => void tick(false), 2000)
    return () => {
      stopped = true
      if (pollingRef.current) window.clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  function shortWorkerVersion(v: string): string {
    const idx = v.lastIndexOf(':')
    return idx >= 0 ? v.slice(idx + 1) : v
  }

  return (
    <Container sx={{ mt: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h3">Pinned Workflow Management</Typography>
        <Divider />
        <SubmitPinnedWorkflow />
        <Typography variant="h5">Active Onboarding Workflows</Typography>
        {loading && <LinearProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundImage: 'linear-gradient(135deg,#182a73 0%, #218aae 69%, #20a7ac 89%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Workflow ID</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Worker Version</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Step</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rows ?? []).map((r) => (
                <TableRow key={r.workflowId}>
                  <TableCell>{r.workflowId}</TableCell>
                  <TableCell>{shortWorkerVersion(r.workerVersion)}</TableCell>
                  <TableCell>{r.step}</TableCell>
                </TableRow>
              ))}
              {(!rows || rows.length === 0) && !loading && !error && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No workflows found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  )
}


