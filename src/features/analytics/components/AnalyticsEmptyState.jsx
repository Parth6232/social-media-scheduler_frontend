// NEW: AnalyticsEmptyState component with animated illustration and quick actions
import { Box, Typography, Button as MuiButton, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import GlassCard from '../../../common/components/motion/GlassCard';
import { useTranslation } from '../../../i18n/useTranslation';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';

const AnalyticsEmptyState = ({ isFiltered = false, onResetFilters }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();

  return (
    <GlassCard sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', borderRadius: 4, my: 4 }}>
      <Box
        component={motion.div}
        animate={reduced ? {} : { y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          width: 80,
          height: 80,
          borderRadius: 4,
          background: 'rgba(37,99,235, 0.1)',
          border: '1px solid rgba(37,99,235, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2.5,
          color: '#2563EB',
          boxShadow: '0 8px 30px rgba(37,99,235, 0.25)',
        }}
      >
        <BarChartIcon sx={{ fontSize: 44 }} />
      </Box>

      <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
        {t('analytics_noDataTitle')}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', mb: 3.5 }}>
        {t('analytics_noDataSubtitle')}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <MuiButton
          variant="contained"
          onClick={() => navigate('/create')}
          startIcon={<AddCircleIcon />}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
            background: '#2563EB',
            boxShadow: '0 4px 14px rgba(37,99,235, 0.4)',
          }}
        >
          {t('analytics_createFirstPost')}
        </MuiButton>

        {isFiltered && (
          <MuiButton
            variant="outlined"
            onClick={onResetFilters}
            startIcon={<FilterAltOffIcon />}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#2563EB',
                color: '#2563EB',
              },
            }}
          >
            {t('analytics_resetFilters')}
          </MuiButton>
        )}
      </Box>
    </GlassCard>
  );
};

export default AnalyticsEmptyState;
