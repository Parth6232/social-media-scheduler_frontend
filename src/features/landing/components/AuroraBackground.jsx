import { Box } from '@mui/material';

/** Landing backdrop: flat canvas with a faint hairline grid that fades out below the hero. */
const AuroraBackground = () => (
  <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', bgcolor: 'background.default',
    backgroundSize: '64px 64px',
    backgroundImage: (t) => `linear-gradient(${t.palette.divider} 1px, transparent 1px), linear-gradient(90deg, ${t.palette.divider} 1px, transparent 1px)`,
    maskImage: 'linear-gradient(180deg, #000 0, transparent 720px)', WebkitMaskImage: 'linear-gradient(180deg, #000 0, transparent 720px)' }} />
);

export default AuroraBackground;
