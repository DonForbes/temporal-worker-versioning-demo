import { Container, Typography, Stack, Button } from "@mui/material";
import SubmitUnpinnedWorkflows from "../form/SubmitUnpinnedWorkflows";
import { NavLink } from "react-router-dom";


export default function HomePage() {
  return (
    <Container sx={{mt: 3}}>
        <Stack spacing={2}>
          <Typography variant="h3">TODO - Setup a selection of tests</Typography>
          <Button component={NavLink} to="/pinned" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
            Go to Pinned Workflow Management
          </Button>
          <SubmitUnpinnedWorkflows />
        </Stack>
    </Container>
  )
}