import { CardContent, Box, Typography, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GlassCard from './components/motion/GlassCard';
import Counter from './components/motion/Counter';

const CommonKpiCard = ({ label, value, icon, color = '#7C3AED', isLoading = false, subtitle, onClick, isActive = false }) => {
  return (
    <GlassCard
      onClick={onClick}
      hoverEffect={!!onClick}
      sx={{
        borderRadius: 3,
        border: isActive ? `2px solid ${color}` : `1px solid ${color}30`,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isActive ? `0 0 0 3px ${color}25` : undefined,
        '&::before': {
          content: '""',
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            {isLoading ? (
              <>
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width={60} height={40} sx={{ mt: 0.5 }} />
              </>
            ) : (
              <>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {label}
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2, mt: 0.5 }}>
                  {value != null ? <Counter value={value} /> : '—'}
                </Typography>
                {subtitle && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14, color: '#4ade80' }} />
                    <Typography variant="caption" sx={{ color: '#4ade80' }}>{subtitle}</Typography>
                  </Box>
                )}
              </>
            )}
          </Box>

          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            backgroundColor: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </GlassCard>
  );
};

export default CommonKpiCard;