import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const CommonKpiCard = ({ label, value, icon, color = '#7C3AED', isLoading = false, subtitle }) => {
  return (
    <Card sx={{
      borderRadius: 3,
      border: `1px solid ${color}20`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 30px ${color}20` },
      '&::before': {
        content: '""',
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }
    }}>
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
                <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.2, mt: 0.5 }}>
                  {value ?? '—'}
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
            backgroundColor: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CommonKpiCard;
