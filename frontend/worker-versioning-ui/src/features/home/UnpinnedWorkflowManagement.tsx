import { Container, Divider, Stack, Typography } from "@mui/material";
import SubmitUnpinnedWorkflows from "../form/SubmitUnpinnedWorkflows";

export default function UnpinnedWorkflowManagement() {
  return (
    <Container sx={{ mt: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h3">Unpinned Workflow Management</Typography>
        <Divider />
        <SubmitUnpinnedWorkflows />
      </Stack>
    </Container>
  )
}


