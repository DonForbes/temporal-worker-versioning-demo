import { Box, Container, CssBaseline } from "@mui/material";

import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";
import './App.css';

function App() {


  return (
    <Box sx={{ backgroundColor: '#eeeeee' , minHeight: '100vh'}}>
      <CssBaseline />
      <NavBar />
      <Container maxWidth={false} sx={{ mt: 3, px: 3 }}>
            <Outlet/>
      </Container>

    </Box>
  );
}

export default App
