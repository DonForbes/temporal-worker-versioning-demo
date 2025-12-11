import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Typography, Paper, Stack, LinearProgress, Alert, FormControlLabel, Switch, TextField } from "@mui/material";
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
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(true);
  const [searchWindow, setSearchWindow] = useState<number>(45);
  const [getRunning, setGetRunning] = useState<boolean>(true);
  const [history, setHistory] = useState<Array<{ t: number; percentages: Record<string, number> }>>([]);
  const [seenFullOwnership, setSeenFullOwnership] = useState<boolean>(false);
  const [didFetchFinal, setDidFetchFinal] = useState<boolean>(false);
  const [finalFetching, setFinalFetching] = useState<boolean>(false);
  const [finalResults, setFinalResults] = useState<QueryResponse | null>(null);
  const [retryNote, setRetryNote] = useState<string | null>(null);

  const body = useMemo(() => ({
    workflowPrefix: workflowPrefix ?? "",
    workflowSearchWindow: searchWindow,
    getRunning,
  }), [workflowPrefix, searchWindow, getRunning]);

  // Latest percentages for legend
  const latestPercentages = useMemo(() => {
    const last = history[history.length - 1];
    return last?.percentages ?? {};
  }, [history]);

  // All observed worker versions (stable ordering)
  const allWorkerKeys = useMemo(() => {
    const keys = new Set<string>();
    history.forEach(h => Object.keys(h.percentages).forEach(k => keys.add(k)));
    return Array.from(keys).sort();
  }, [history]);

  // High-contrast palette sized for typical 2–5 series
  const PALETTE = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD'];
  function colorForKey(key: string): string {
    const idx = allWorkerKeys.indexOf(key);
    if (idx >= 0) return PALETTE[idx % PALETTE.length];
    // Fallback for unseen keys (e.g., only in finalResults)
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 45%)`;
  }

  useEffect(() => {
    let stopped = false;

    async function tick(initial = false) {
      try {
        if (initial) setLoading(true);
        const res = await http.post<QueryResponse>("/query-marketing-workflows", body);
        if (stopped) return;
        setData(res.data);
        setError(null);
        setRetryNote(null);
        setLoading(false);
        // Snapshot percentages for chart
        const total = res.data.workflowTotal;
        const percMap: Record<string, number> = {};
        // Track if any worker has ever owned 100% of workflows at a sample
        const fullOwnershipThisSample =
          total > 0 &&
          Object.values(res.data.workers).some(w => w.numberOfWorkflows === total);
        if (fullOwnershipThisSample && !seenFullOwnership) {
          setSeenFullOwnership(true);
        }
        if (total > 0) {
          Object.values(res.data.workers).forEach(w => {
            percMap[w.workerVersion] = (w.numberOfWorkflows / total) * 100;
          });
        } else {
          Object.values(res.data.workers).forEach(w => {
            percMap[w.workerVersion] = 0;
          });
        }
        setHistory(prev => {
          const next = [...prev, { t: Date.now(), percentages: percMap }];
          return next.length > 300 ? next.slice(next.length - 300) : next;
        });
        // Only stop after we have previously observed a worker at 100%,
        // and we now observe no active workflows (total === 0)
        if (res.data.workflowTotal === 0 && seenFullOwnership) {
          // Stop polling
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          pollingRef.current = null;
          setPollingEnabled(false);
          // Do a final wide-window query (1 hour) once
          if (!didFetchFinal) {
            setDidFetchFinal(true);
            setFinalFetching(true);
            try {
              const finalRes = await http.post<QueryResponse>("/query-marketing-workflows", {
                workflowPrefix: workflowPrefix ?? "",
                workflowSearchWindow: 3600,
                getRunning: false,
              });
              setFinalResults(finalRes.data);
            } catch (e) {
              // Keep main error separate; show final query error inline
              const msg = e instanceof Error ? e.message : "Failed to fetch final summary";
              setError(msg);
            } finally {
              setFinalFetching(false);
            }
          }
        }
      } catch (err: any) {
        if (stopped) return;
        const status = err?.response?.status;
        if (status === 500) {
          const msg = (err?.response?.data?.message as string) || (err?.message as string) || "Server error";
          setRetryNote(`${msg} - retrying`);
          // Retry after 1 second
          window.setTimeout(() => { if (!stopped) void tick(false); }, 1000);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to query results");
        setLoading(false);
      }
    }

    // initial fetch (always fetch once on params/body change)
    void tick(true);

    // poll every 2s when enabled
    if (pollingEnabled) {
      pollingRef.current = window.setInterval(() => void tick(false), 2000);
    }

    return () => {
      stopped = true;
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [body, pollingEnabled, seenFullOwnership, didFetchFinal, workflowPrefix]);

  // Minimal SVG line chart for percentages over time
  function LinesChart() {
    const width = 800;
    const height = 300;
    const padding = 32;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const n = history.length;
    const t0 = n > 0 ? history[0].t : Date.now();

    function xForIndex(i: number): number {
      if (n <= 1) return padding;
      return padding + (i / (n - 1)) * innerW;
    }
    function yForPercent(p: number): number {
      const clamped = Math.max(0, Math.min(100, p));
      return padding + innerH - (clamped / 100) * innerH;
    }
    function formatRelativeTime(ms: number): string {
      const totalSec = Math.max(0, Math.round(ms / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return m > 0 ? `${m}m ${s}s` : `${s}s`;
    }
    function pathForKey(key: string): string {
      let d = "";
      for (let i = 0; i < n; i++) {
        const p = history[i]?.percentages?.[key] ?? 0;
        const x = xForIndex(i);
        const y = yForPercent(p);
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
      return d;
    }
    const gridVals = [0, 25, 50, 75, 100];
    // Choose up to 6 x-axis ticks across history indices
    const xTickCount = Math.min(6, Math.max(2, n));
    const xTickIdxs = Array.from({ length: xTickCount }, (_, i) => {
      if (xTickCount === 1) return 0;
      return Math.round((i / (xTickCount - 1)) * (n - 1));
    }).filter((v, i, arr) => arr.indexOf(v) === i);
    return (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
          <rect x={padding} y={padding} width={innerW} height={innerH} fill="#fff" stroke="#ddd" />
          {gridVals.map((v) => {
            const y = yForPercent(v);
            return <line key={v} x1={padding} y1={y} x2={padding + innerW} y2={y} stroke="#eee" />;
          })}
          {allWorkerKeys.map((k) => (
            <path key={k} d={pathForKey(k)} fill="none" stroke={colorForKey(k)} strokeWidth={2} />
          ))}
          {gridVals.map((v) => {
            const y = yForPercent(v);
            return (
              <text key={`t${v}`} x={padding - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#555">
                {v}%
              </text>
            );
          })}
          {/* x-axis ticks and time labels */}
          {xTickIdxs.map((idx) => {
            const x = xForIndex(idx);
            const y = padding + innerH;
            const tVal = history[idx]?.t;
            const rel = tVal ? (tVal - t0) : 0;
            return (
              <g key={`x${idx}`}>
                <line x1={x} y1={y} x2={x} y2={y + 6} stroke="#ccc" />
                <text x={x} y={y + 16} textAnchor="middle" dominantBaseline="hanging" fontSize="10" fill="#555">
                  {formatRelativeTime(rel)}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Marketing workflow (Unpinned) Test Results</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Search window (s)"
              type="number"
              size="small"
              inputProps={{ min: 1 }}
              value={searchWindow}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSearchWindow(Number.isFinite(val) && val > 0 ? val : 1);
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={getRunning}
                  onChange={(_, checked) => setGetRunning(checked)}
                />
              }
              label="Running only"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={pollingEnabled}
                  onChange={(_, checked) => setPollingEnabled(checked)}
                />
              }
              label="Polling"
            />
          </Stack>
        </Stack>
        <Typography variant="subtitle1" color="text.secondary">
          Prefix: {workflowPrefix}
        </Typography>

        {loading && <LinearProgress />}
        {retryNote ? (
          <Typography variant="body2" color="text.secondary">{retryNote}</Typography>
        ) : (
          error && <Alert severity="error">{error}</Alert>
        )}

        {data && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Deployment: {data.workerDeployment}</Typography>
              <Typography>Total workflows: {data.workflowTotal}</Typography>
              <LinesChart />
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {allWorkerKeys.length === 0 ? (
                  <Typography color="text.secondary">No worker versions observed yet.</Typography>
                ) : (
                  allWorkerKeys.map(k => (
                    <Stack key={k} direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 12, height: 12, bgcolor: colorForKey(k), borderRadius: 0.5 }} />
                      <Typography variant="body2">
                        {k}: {(latestPercentages[k] ?? 0).toFixed(1)}%
                      </Typography>
                    </Stack>
                  ))
                )}
              </Stack>
              {/* Final 1-hour summary under the graph */}
              <Stack spacing={1}>
                <Typography variant="h6">Final summary (last 1h)</Typography>
                {finalFetching && <LinearProgress />}
                {!finalFetching && finalResults && (
                  <Box>
                    {finalResults.workflowTotal === 0 ? (
                      <Typography color="text.secondary">No completed workflows found in the last hour.</Typography>
                    ) : (
                      <Stack spacing={1.5}>
                        {Object.values(finalResults.workers)
                          .sort((a, b) => b.numberOfWorkflows - a.numberOfWorkflows)
                          .map(w => {
                            const percent = (w.numberOfWorkflows / finalResults.workflowTotal) * 100;
                            return (
                              <Box key={w.workerVersion}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" sx={{ mr: 2 }} noWrap>
                                    {w.workerVersion}
                                  </Typography>
                                  <Typography variant="body2">
                                    {w.numberOfWorkflows} ({percent.toFixed(1)}%)
                                  </Typography>
                                </Stack>
                                <Box sx={{ height: 12, backgroundColor: "#eee", borderRadius: 1, overflow: "hidden" }}>
                                  <Box sx={{ height: 12, width: `${percent}%`, backgroundColor: colorForKey(w.workerVersion) }} />
                                </Box>
                              </Box>
                            );
                          })}
                      </Stack>
                    )}
                  </Box>
                )}
              </Stack>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
