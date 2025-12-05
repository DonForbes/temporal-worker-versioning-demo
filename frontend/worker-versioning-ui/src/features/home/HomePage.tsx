import { Container, Typography, Stack, Button } from "@mui/material";
import { NavLink } from "react-router-dom";


export default function HomePage() {
  return (
    <Container sx={{mt: 3}}>
        <Stack spacing={2}>
          <Typography variant="h3">Worker Versioning for Pinned and Unpinned workflows</Typography>
          <Typography variant="body1">Worker versioning allows for a controlled rollout of new worker versions.  Workflows 
            are either unpinned or pinned.  
            <br /><br />
            Unpinned workflows will automatically migrate to be progressed by the most recent 
            worker version deployed.  The worker controller can manage the speed at which workflows migrate to the new release. Allowing 
            the operator to start by only allowing a small number of workflows to be processed on the new version.
            <br /><br />
            Pinned workflows become fixed to a specific worker version and will not migrate unless an operator specifically
            intervenes to do so.

            </Typography>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              component={NavLink}
              to="/unpinned"
              variant="contained"
              sx={{
                flex: 1,
                bgcolor: '#182a73',
                color: '#fff',
                textTransform: 'none',
                '&:hover': { bgcolor: '#13215a' }
              }}
            >
              Go to Unpinned Workflow Management
            </Button>
            <Button
              component={NavLink}
              to="/pinned"
              variant="contained"
              sx={{
                flex: 1,
                bgcolor: '#182a73',
                color: '#fff',
                textTransform: 'none',
                '&:hover': { bgcolor: '#13215a' }
              }}
            >
              Go to Pinned Workflow Management
            </Button>
          </Stack>
        </Stack>
    </Container>
  )
}