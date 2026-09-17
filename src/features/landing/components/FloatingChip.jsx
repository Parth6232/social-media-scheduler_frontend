import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/**
 * Small glass "HUD" card that gently floats in place and lifts on hover/tap.
 * Used for the hero's Scheduled Post / Analytics / Engagement / Automation chips.
 */
const FloatingChip = ({ icon, label, value, sx, delay = 0, duration = 6, color = '#8B5CF6' }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      animate={reduced ? {} : { y: [0, -10, 0] }}
      style={{ position: 'absolute', ...sx }}
      {...(reduced
        ? {}
        : { transition: { repeat: Infinity, duration, ease: 'easeInOut', delay } })}
    >
      <Paper
        component={motion.div}
        whileHover={reduced ? {} : { y: -6, scale: 1.03, rotateX: 4 }}
        elevation={0}
        sx={{
          px: 1.75,
          py: 1.1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.1,
          borderRadius: 3,
          backdropFilter: 'blur(18px)',
          backgroundColor: isDark ? 'rgba(20, 16, 40, 0.55)' : 'rgba(255,255,255,0.75)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(139,92,246,0.15)',
          boxShadow: isDark
            ? '0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 10px 30px rgba(139,92,246,0.14), inset 0 1px 0 rgba(255,255,255,0.6)',
          transformStyle: 'preserve-3d',
          cursor: 'default',
          whiteSpace: 'nowrap',
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${color}33, ${color}11)`,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0}>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default FloatingChip;
