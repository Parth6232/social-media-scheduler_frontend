import React from 'react';
import { Box } from '@mui/material';

const ITEMS = ['YouTube', 'Facebook', 'Instagram', 'LinkedIn', 'Schedule once, post everywhere', 'Plan your week in minutes', 'Reels, photos, stories & more'];

/** Slim status strip with a slow marquee; pauses on hover. */
const Ticker = () => {
  const row = ITEMS.map((t, i) => (
    <Box key={i} component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, px: 2 }}>
      {t} <Box component="span" sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0 0 8px rgba(37,99,235,.8)' }} />
    </Box>
  ));
  return (
    <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap', py: 0.7, color: 'text.secondary', fontWeight: 500, fontSize: '0.78rem',
      borderBottom: '1px solid', borderColor: 'divider', bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)'),
      maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
      '&:hover > div': { animationPlayState: 'paused' } }}>
      <Box sx={{ display: 'inline-block', animation: 'pp-marquee 48s linear infinite' }}>{row}{row}{row}{row}</Box>
    </Box>
  );
};

export default Ticker;
