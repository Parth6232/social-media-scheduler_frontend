import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import FlightIcon from '@mui/icons-material/Flight';

const ease = [0.2, 0.8, 0.2, 1];

/** Page title with a "contrail": a small plane draws the route line under the heading once on load. */
const PageHeader = ({ icon, title, subtitle, actions, leading, sx = {} }) => {
  const [text, wave] = String(title).split('👋');
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3.5, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        {leading}
        {icon && (
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', color: 'primary.main', boxShadow: (t) => t.custom.lift(1), '& svg': { fontSize: 22 } }}>
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.45rem', md: '1.75rem' } }}>
            {text}
            {wave !== undefined && <Box component="span" sx={{ display: 'inline-block', ml: 0.5, transformOrigin: '70% 80%', animation: 'pp-wave 2.2s .6s ease-in-out 2' }}>👋</Box>}
            {wave}
          </Typography>
          <Box sx={{ position: 'relative', width: 150, height: 14, mt: 0.5 }}>
            <Box sx={{ position: 'absolute', left: 0, right: 0, top: 7, borderTop: '1.5px dashed', borderColor: 'divider' }} />
            <Box component={motion.div} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease, delay: 0.25 }}
              sx={{ position: 'absolute', left: 0, right: 0, top: 6.25, height: 1.5, bgcolor: 'primary.main', transformOrigin: 'left' }} />
            <Box component={motion.span} initial={{ left: '0%', opacity: 1 }} animate={{ left: '100%', opacity: [1, 1, 0] }} transition={{ duration: 1.1, ease, delay: 0.25 }}
              sx={{ position: 'absolute', top: 0, transform: 'translateX(-100%)', lineHeight: 0, color: 'primary.main' }}>
              <FlightIcon sx={{ fontSize: 14, transform: 'rotate(90deg)' }} />
            </Box>
          </Box>
          {subtitle && <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
      </Box>
      {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>{actions}</Box>}
    </Box>
  );
};

export default PageHeader;
