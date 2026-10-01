import { CardContent, Box, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GlassCard from './components/motion/GlassCard';
import FlapNumber from './components/motion/FlapNumber';

/** `total` (optional) drives the thin progress bar: value / total. */
const CommonKpiCard = ({ label, value, total, icon, color = '#2563EB', isLoading = false, subtitle, onClick, isActive = false }) => {
  const fraction = total ? Math.min(1, (value || 0) / total) : 1;
  return (
    <GlassCard
      onClick={onClick}
      hoverEffect={!!onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        borderColor: isActive ? color : undefined,
        boxShadow: isActive ? `0 0 0 3px color-mix(in srgb, ${color} 18%, transparent)` : undefined,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            {isLoading ? (
              <>
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width={60} height={44} />
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
                <Typography variant="h3" sx={{ mt: 0.5, fontSize: '2.2rem', fontVariantNumeric: 'tabular-nums' }}>
                  {value != null ? <FlapNumber value={value} /> : '—'}
                </Typography>
                {subtitle && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{subtitle}</Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, bgcolor: `color-mix(in srgb, ${color} 12%, transparent)`, '& svg': { fontSize: 20 } }}>
            {icon}
          </Box>
        </Box>
        <Box sx={{ mt: 2, height: 4, borderRadius: 4, overflow: 'hidden', bgcolor: 'action.hover' }}>
          <Box component={motion.div} initial={{ width: 0 }} animate={{ width: `${(isLoading ? 0 : fraction) * 100}%` }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
            sx={{ height: '100%', borderRadius: 4, bgcolor: color }} />
        </Box>
      </CardContent>
    </GlassCard>
  );
};

export default CommonKpiCard;
