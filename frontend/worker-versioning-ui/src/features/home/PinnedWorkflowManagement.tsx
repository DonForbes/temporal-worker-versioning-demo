import { Container, Typography, Stack, Divider } from "@mui/material";
import SubmitPinnedWorkflow from "../form/SubmitPinnedWorkflow";

export default function PinnedWorkflowManagement() {
  return (
    <Container sx={{ mt: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h3">Pinned Workflow Management</Typography>
        <Divider />
        <SubmitPinnedWorkflow />
      </Stack>
    </Container>
  )
}


