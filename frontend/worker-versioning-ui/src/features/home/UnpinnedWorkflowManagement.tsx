import { Container, Divider, Stack, Typography, Box, Paper } from "@mui/material";
import SubmitUnpinnedWorkflows from "../form/SubmitUnpinnedWorkflows";

export default function UnpinnedWorkflowManagement() {
  return (
    <Container sx={{ mt: 3 }}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.92)' }}>
        <Stack spacing={2}>
          <Typography variant="h3">Unpinned Workflow Management</Typography>
          <Divider />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
            <Stack sx={{ flex: 1, width: '100%' }}>
              <SubmitUnpinnedWorkflows />
            </Stack>
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Box sx={{ height: 16 }} /> 
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Example - Marketing campaign
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This screen allows you to start multiple unpinned workflows that will 
                orchestrate a marketing campaign.  These will automatically upgrade to 
                newer versions of the workers as they become available.
                <br></br> 
                The ramp up speed is dictated by the worker controller configuration.  In 
                this case they will ramp to 10% immediately wait for 30s then ramp up to 
                80% before reaching 100% after a further 30s.
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}


