// NEW: AnalyticsSkeleton component for smooth initial loading
import { Box, Grid, Skeleton } from '@mui/material';
import GlassCard from '../../../common/components/motion/GlassCard';

const AnalyticsSkeleton = () => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Header skeleton */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box>
            <Skeleton variant="text" width={280} height={42} />
            <Skeleton variant="text" width={380} height={20} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 2.5 }} />
            <Skeleton variant="rectangular" width={130} height={40} sx={{ borderRadius: 2.5 }} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 3 }} />
      </Box>

      {/* 6 KPI Cards Skeleton */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <GlassCard sx={{ height: 130, borderRadius: 3.5, p: 2 }}>
              <Skeleton variant="text" width={70} height={18} />
              <Skeleton variant="text" width={100} height={42} sx={{ my: 0.5 }} />
              <Skeleton variant="text" width={60} height={18} />
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Insights Skeleton */}
      <Skeleton variant="rectangular" width="100%" height={68} sx={{ borderRadius: 3, mb: 4 }} />

      {/* Big Timeline Chart Skeleton */}
      <GlassCard sx={{ height: 380, borderRadius: 3.5, p: 3, mb: 4 }}>
        <Skeleton variant="text" width={220} height={30} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={290} sx={{ borderRadius: 2 }} />
      </GlassCard>

      {/* Two column row skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <GlassCard sx={{ height: 360, borderRadius: 3.5, p: 3 }}>
            <Skeleton variant="text" width={200} height={28} />
            <Skeleton variant="rectangular" width="100%" height={280} sx={{ mt: 2, borderRadius: 2 }} />
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GlassCard sx={{ height: 360, borderRadius: 3.5, p: 3 }}>
            <Skeleton variant="text" width={200} height={28} />
            <Skeleton variant="rectangular" width="100%" height={280} sx={{ mt: 2, borderRadius: 2 }} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsSkeleton;
