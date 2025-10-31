import { Container, Typography } from "@mui/material";
import SubmitUnpinnedWorkflows from "../form/SubmitUnpinnedWorkflows";


export default function HomePage() {
  return (
    <Container sx={{mt: 3}}>
        <Typography variant="h3">TODO - Setup a selection of tests</Typography>
        <SubmitUnpinnedWorkflows />
    </Container>
  )
}