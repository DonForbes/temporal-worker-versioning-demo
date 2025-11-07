import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Typography, Paper, Stack, LinearProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import http from "../../lib/http/axios";

interface WorkerBreakdownItem {
  workerVersion: string;
  numberOfWorkflows: number;
}

interface QueryResponse {
  workerDeployment: string;
  workflowTotal: number;
  workers: Record<string, WorkerBreakdownItem>;
}

export default function UnpinnedTestResults() {
  const { workflowPrefix } = useParams<{ workflowPrefix: string }>();
  const [data, setData] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const pollingRef = useRef<number | null>(null);

  const body = useMemo(() => ({
    workflowPrefix: workflowPrefix ?? "",
    workflowSearchWindow: 10,
  }), [workflowPrefix]);

  const percentages = useMemo(() => {
    if (!data || data.workflowTotal === 0) return [] as Array<{ label: string; percent: number; count: number }>;
    return Object.values(data.workers)
      .map(w => ({ label: w.workerVersion, percent: (w.numberOfWorkflows / data.workflowTotal) * 100, count: w.numberOfWorkflows }))
      .sort((a, b) => b.percent - a.percent);
  }, [data]);

  useEffect(() => {
    let stopped = false;

    async function tick(initial = false) {
      try {
        if (initial) setLoading(true);
        const res = await http.post<QueryResponse>("/query-marketing-workflows", body);
        if (stopped) return;
        setData(res.data);
        setError(null);
        setLoading(false);
        if (res.data.workflowTotal === 0) {
          // All workflows completed; stop polling
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } catch (err) {
        if (stopped) return;
        setError(err instanceof Error ? err.message : "Failed to query results");
        setLoading(false);
      }
    }

    // initial fetch
    void tick(true);

    // poll every 2s
    pollingRef.current = window.setInterval(() => void tick(false), 2000);

    return () => {
      stopped = true;
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [body]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Stack spacing={2}>
        <Typography variant="h4">Unpinned Test Results</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Prefix: {workflowPrefix}
        </Typography>

        {loading && <LinearProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {data && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Deployment: {data.workerDeployment}</Typography>
              <Typography>Total workflows: {data.workflowTotal}</Typography>

              {/* Bar chart */}
              <Box sx={{ mt: 2 }}>
                {percentages.length === 0 ? (
                  <Typography color="text.secondary">No active workflows.</Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {percentages.map(item => (
                      <Box key={item.label}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" sx={{ mr: 2 }} noWrap>
                            {item.label}
                          </Typography>
                          <Typography variant="body2">{item.count} ({item.percent.toFixed(1)}%)</Typography>
                        </Stack>
                        <Box sx={{ height: 12, backgroundColor: "#eee", borderRadius: 1, overflow: "hidden" }}>
                          <Box sx={{ height: 12, width: `${item.percent}%`, backgroundColor: "primary.main" }} />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
