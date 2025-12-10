import { Container, Typography, Stack, Button, Box } from "@mui/material";
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
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Button
                component={NavLink}
                to="/unpinned"
                variant="contained"
                sx={{
                  bgcolor: '#182a73',
                  color: '#fff',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#13215a' }
                }}
              >
                Go to Unpinned Workflow Management
              </Button>
              <Box sx={{ height: 16 }} /> 
              <Typography variant="body2" color="text.secondary">
                <Typography variant="h5">Example Unpinned</Typography> 
                <br></br> Marketing campaign that may take time to run but the 
                business wants to use the latest capabilities at all times.
              </Typography>
              <Box
                component="img"
                src="/images/marketing-campaign-workflow.jpg"
                alt="Example Unpinned: Marketing campaign workflow"
                sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
                loading="lazy"
              />
            </Stack>

            <Stack spacing={1} sx={{ flex: 1 }}>
              <Button
                component={NavLink}
                to="/pinned"
                variant="contained"
                sx={{
                  bgcolor: '#182a73',
                  color: '#fff',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#13215a' }
                }}
              >
                Go to Pinned Workflow Management
              </Button>
              <Box sx={{ height: 16 }} /> 
              <Typography variant="body2" color="text.secondary">
                <Typography variant="h5">Example pinned</Typography> <br></br>
                An onbaording workflow to capture and provision systems for a
                 new user.  Something that when started must follow the steps
                  as defined at the time the process was started.
              </Typography>
              <Box
                component="img"
                src="/images/onboarding-workflow.jpg"
                alt="Example pinned: Onboarding workflow"
                sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
                loading="lazy"
              />
            </Stack>
          </Stack>
        </Stack>
    </Container>
  )
}