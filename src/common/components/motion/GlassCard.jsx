import React from 'react';
import { Card } from '@mui/material';

/** Flat surface card: hairline border, quiet shadow; border darkens on hover. Name kept so existing imports work. */
const GlassCard = ({ children, sx = {}, hoverEffect = false, tilt: _tilt, authCard = false, ...props }) => (
  <Card
    sx={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: authCard ? '20px' : '14px',
      '&:hover': { borderColor: 'text.disabled' },
      '&:active': hoverEffect ? { transform: 'scale(.995)' } : undefined,
      ...sx,
    }}
    {...props}
  >
    {children}
  </Card>
);

export default GlassCard;
