import React from 'react';
import { Box, useTheme } from '@mui/material';

const ROUTES = [
  { d: 'M-40 640 Q 330 120 760 330 T 1480 90', dur: 46, delay: 0 },
  { d: 'M-40 300 Q 420 700 900 520 T 1480 760', dur: 58, delay: -20 },
  { d: 'M300 940 Q 700 560 1080 640 T 1480 420', dur: 64, delay: -38 },
];
const CITIES = [[760, 330], [900, 520], [1080, 640]];

/** App canvas: faint flight routes with small planes drifting along them. Pure SVG (SMIL) so it scales and costs almost nothing. */
const PlayBackground = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const stroke = dark ? 'rgba(255,255,255,0.10)' : 'rgba(16,24,40,0.12)';
  const plane = dark ? 'rgba(255,255,255,0.45)' : 'rgba(16,24,40,0.4)';

  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', bgcolor: 'background.default', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        {ROUTES.map((r) => <path key={r.d} d={r.d} stroke={stroke} strokeWidth="1.2" strokeDasharray="2 7" strokeLinecap="round" />)}
        {CITIES.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="2.6" fill={plane} />
            {!reduced && (
              <circle cx={x} cy={y} r="3" stroke={plane} strokeWidth="1">
                <animate attributeName="r" values="3;16" dur="3.6s" begin={`${i * 1.2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0" dur="3.6s" begin={`${i * 1.2}s`} repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
        {!reduced && ROUTES.map((r) => (
          <g key={`p${r.d}`}>
            <path d="M7 0 L-6 -4.5 L-3.5 0 L-6 4.5 Z" fill={plane}>
              <animateMotion dur={`${r.dur}s`} begin={`${r.delay}s`} repeatCount="indefinite" rotate="auto" path={r.d} />
            </path>
          </g>
        ))}
      </svg>
    </Box>
  );
};

export default PlayBackground;
