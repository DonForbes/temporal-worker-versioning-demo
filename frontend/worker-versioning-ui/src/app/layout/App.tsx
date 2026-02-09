import { useEffect, useRef } from "react";
import { Box, Container, CssBaseline } from "@mui/material";

import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";
import './App.css';

type NeatInstance = {
  destroy?: () => void;
};
type NeatModule = {
  NeatGradient: new (opts: Record<string, unknown>) => NeatInstance;
};

function App() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let neat: NeatInstance | undefined;
    let cancelled = false;
    (async () => {
      try {
        // @ts-expect-error TS cannot resolve remote ESM URL types at build time
        const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@firecms/neat@0.3.0/+esm');
        const { NeatGradient } = (mod as unknown as NeatModule);
        if (cancelled || !canvasRef.current) return;
        neat = new NeatGradient({
          ref: canvasRef.current,
          colors: [
            { color: '#FDA110', enabled: true },
            { color: '#444CE7', enabled: true },
            { color: '#211B4E', enabled: true },
            { color: '#D300DB', enabled: true },
            { color: '#f5e1e5', enabled: false },
          ],
          speed: 1.5,
          horizontalPressure: 3,
          verticalPressure: 5,
          waveFrequencyX: 2,
          waveFrequencyY: 3,
          waveAmplitude: 5,
          shadows: 0,
          highlights: 2,
          colorBrightness: 1,
          colorSaturation: 7,
          wireframe: false,
          colorBlending: 7,
          backgroundColor: '#003FFF',
          backgroundAlpha: 1,
          grainScale: 2,
          grainSparsity: 0,
          grainIntensity: 0.5,
          grainSpeed: 1,
          resolution: 1,
        });
      } catch {
        void 0;
      }
    })();
    return () => {
      cancelled = true;
      try { neat?.destroy?.(); } catch { void 0; }
    };
  }, []);

  return (
    <Box sx={{ backgroundColor: '#eeeeee' , minHeight: '100vh', position: 'relative' }}>
      <canvas
        id="gradient-canvas"
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      />
      <CssBaseline />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <NavBar />
        <Container maxWidth={false} sx={{ mt: 3, px: 3 }}>
            <Outlet/>
        </Container>
      </Box>

    </Box>
  );
}

export default App
