import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import usePrefersReducedMotion from '../../../features/landing/hooks/usePrefersReducedMotion';

/**
 * Decorative floating HUD chips placed around the auth card.
 * Pure eye-candy — never overlaps the form on any breakpoint.
 * Mimics the hero section FloatingChip component visual style.
 */

const CHIPS = [
  {
    icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
    label: 'Smart Scheduling',
    value: 'Auto-publish',
    color: '#8B5CF6',
    sx: { top: '8%', left: { xs: '-120%', md: '-185px' }, display: { xs: 'none', md: 'block' } },
    delay: 0,
    duration: 7,
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 16 }} />,
    label: 'Analytics',
    value: '↑ 38% reach',
    color: '#22D3EE',
    sx: { top: '38%', left: { xs: '-120%', md: '-200px' }, display: { xs: 'none', md: 'block' } },
    delay: 0.8,
    duration: 8,
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} />,
    label: 'Automation',
    value: 'AI-powered',
    color: '#D946EF',
    sx: { top: '12%', right: { xs: '-120%', md: '-195px' }, display: { xs: 'none', md: 'block' } },
    delay: 0.4,
    duration: 9,
  },
  {
    icon: <ThumbUpAltIcon sx={{ fontSize: 16 }} />,
    label: 'Engagement',
    value: '92% avg',
    color: '#F472B6',
    sx: { top: '52%', right: { xs: '-120%', md: '-190px' }, display: { xs: 'none', md: 'block' } },
    delay: 1.2,
    duration: 6,
  },
];

const Chip = ({ icon, label, value, color, sx, delay, duration }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={reduced ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -9, 0] }}
      transition={
        reduced
          ? { duration: 0.5, delay }
          : { opacity: { duration: 0.5, delay }, scale: { duration: 0.5, delay }, y: { duration, repeat: Infinity, ease: 'easeInOut', delay } }
      }
      sx={{ position: 'absolute', ...sx }}
    >
      <Paper
        component={motion.div}
        whileHover={reduced ? {} : { y: -5, scale: 1.04 }}
        elevation={0}
        sx={{
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: '12px',
          backdropFilter: 'blur(18px)',
          backgroundColor: isDark ? 'rgba(18, 14, 38, 0.6)' : 'rgba(255,255,255,0.78)',
          border: isDark ? '1px solid rgba(255,255,255,0.09)' : `1px solid ${color}26`,
          boxShadow: isDark
            ? `0 8px 26px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`
            : `0 8px 26px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.7)`,
          whiteSpace: 'nowrap',
          cursor: 'default',
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${color}33, ${color}12)`,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0}>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.15, fontSize: '0.65rem' }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.75rem' }}>
            {value}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

/**
 * Renders all decorative HUD chips relative to the parent container.
 * The parent (auth layout wrapper) must be `position: relative`.
 */
const AuthFloatingChips = () => {
  return (
    <>
      {CHIPS.map((chip, i) => (
        <Chip key={i} {...chip} />
      ))}
    </>
  );
};

export default AuthFloatingChips;
