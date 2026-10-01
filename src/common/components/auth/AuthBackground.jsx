import { Box } from '@mui/material';

/** Auth backdrop: flat canvas with a faint dot grid. */
const AuthBackground = () => (
  <Box aria-hidden="true" sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', bgcolor: 'background.default',
    backgroundSize: '22px 22px',
    backgroundImage: (t) => `radial-gradient(${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)'} 1px, transparent 1.2px)`,
    maskImage: 'radial-gradient(ellipse at 50% 40%, #000 0%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 0%, transparent 75%)' }} />
);

export default AuthBackground;
