// NEW: InsightsStrip component displaying automated intelligent insights
import { Box, Typography, useTheme } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { motion } from 'framer-motion';

import { useTranslation } from '../../../i18n/useTranslation';
import { tFormat, formatHour } from '../utils/analyticsFormatters';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';

const TYPE_CONFIG = {
  success: {
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.25)',
    icon: <AutoAwesomeIcon sx={{ fontSize: 18, color: '#10B981' }} />,
  },
  warning: {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.25)',
    icon: <WarningAmberIcon sx={{ fontSize: 18, color: '#F59E0B' }} />,
  },
  info: {
    color: '#2563EB',
    bg: 'rgba(37,99,235, 0.1)',
    border: 'rgba(37,99,235, 0.25)',
    icon: <LightbulbIcon sx={{ fontSize: 18, color: '#2563EB' }} />,
  },
};

const InsightsStrip = ({ insights = [] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();

  if (!insights || insights.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 1,
          '::-webkit-scrollbar': { height: 6 },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: 3,
          },
        }}
      >
        {insights.map((insight, idx) => {
          const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;
          const translationKey = `insight_${insight.key}`;

          // Format parameters: translate postType, format hour, capitalize platform
          const formattedParams = { ...(insight.params || {}) };
          if (formattedParams.hour !== undefined) {
            formattedParams.hour = formatHour(formattedParams.hour);
          }
          if (formattedParams.platform) {
            formattedParams.platform =
              formattedParams.platform.charAt(0).toUpperCase() + formattedParams.platform.slice(1);
          }
          if (formattedParams.postType) {
            formattedParams.postType =
              t(`postType_${formattedParams.postType}`) || formattedParams.postType;
          }

          const message = tFormat(t(translationKey), formattedParams);

          return (
            <Box
              key={`${insight.key}-${idx}`}
              component={motion.div}
              initial={reduced ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              sx={{
                flex: { xs: '0 0 280px', sm: '0 0 340px', md: '1 1 0' },
                minWidth: 260,
                p: 2,
                borderRadius: 3,
                bgcolor: config.bg,
                border: `1px solid ${config.border}`,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: `${config.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? 'text.primary' : '#1E293B',
                    fontWeight: 500,
                    lineHeight: 1.45,
                    fontSize: '0.84rem',
                  }}
                >
                  {message}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default InsightsStrip;
