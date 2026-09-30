// NEW: PostTypeBreakdown component with Horizontal Bars, Metric Toggles, and Top Performer Badge
import { useState, useMemo } from 'react';
import { Box, Typography, CardContent, Chip, LinearProgress, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';

import GlassCard from '../../../common/components/motion/GlassCard';
import { useTranslation } from '../../../i18n/useTranslation';
import { formatCompactNumber, formatFullNumber } from '../utils/analyticsFormatters';

const METRIC_TOGGLES = [
  { key: 'avgViews', labelKey: 'analytics_metricAvgViews' },
  { key: 'avgLikes', labelKey: 'analytics_metricAvgLikes' },
  { key: 'posts', labelKey: 'analytics_metricTotalPosts' },
];

const PostTypeBreakdown = ({ postTypes = [] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeMetric, setActiveMetric] = useState('avgViews');

  const maxVal = useMemo(() => {
    if (!postTypes.length) return 1;
    return Math.max(...postTypes.map((pt) => pt[activeMetric] || 0), 1);
  }, [postTypes, activeMetric]);

  // Find top performer by current metric
  const topPostType = useMemo(() => {
    if (!postTypes.length) return null;
    return [...postTypes].sort((a, b) => (b[activeMetric] || 0) - (a[activeMetric] || 0))[0]?.postType;
  }, [postTypes, activeMetric]);

  return (
    <GlassCard sx={{ mb: 4, borderRadius: 3.5 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header & Metric Controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>
              {t('analytics_postTypesTitle')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Compare engagement velocity across different content formats
            </Typography>
          </Box>

          {/* Metric Selector Buttons */}
          <Box
            sx={{
              display: 'inline-flex',
              p: 0.5,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.04)',
            }}
          >
            {METRIC_TOGGLES.map((metric) => {
              const isSelected = activeMetric === metric.key;
              return (
                <Box
                  key={metric.key}
                  component="button"
                  onClick={() => setActiveMetric(metric.key)}
                  sx={{
                    position: 'relative',
                    px: { xs: 1.2, sm: 1.8 },
                    py: 0.5,
                    borderRadius: 1.5,
                    border: 'none',
                    background: 'transparent',
                    color: isSelected ? '#ffffff' : 'text.secondary',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    zIndex: 1,
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: isSelected ? '#ffffff' : 'text.primary',
                    },
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-posttype-metric"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)',
                        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)',
                        zIndex: -1,
                      }}
                    />
                  )}
                  {t(metric.labelKey)}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* List of Formats */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {postTypes.map((pt) => {
            const label = t(`postType_${pt.postType}`) || pt.postType;
            const currentVal = pt[activeMetric] || 0;
            const barPercent = Math.min(100, Math.round((currentVal / maxVal) * 100));
            const isTop = pt.postType === topPostType && currentVal > 0;

            return (
              <Box
                key={pt.postType}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: isTop
                    ? isDark
                      ? 'rgba(124, 58, 237, 0.08)'
                      : 'rgba(124, 58, 237, 0.04)'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.02)',
                  border: isTop
                    ? '1px solid rgba(124, 58, 237, 0.35)'
                    : isDark
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Header of Item */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                      {label}
                    </Typography>
                    {isTop && (
                      <Chip
                        icon={<StarIcon sx={{ fontSize: '13px !important', color: '#F59E0B !important' }} />}
                        label={t('analytics_topBadge')}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: 'rgba(245, 158, 11, 0.15)',
                          color: '#F59E0B',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {pt.posts} posts · {pt.successRate != null ? `${pt.successRate}% success` : ''}
                    </Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: isTop ? '#8B5CF6' : 'text.primary' }}>
                      {formatFullNumber(currentVal)}
                    </Typography>
                  </Box>
                </Box>

                {/* Relative Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={barPercent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: isTop
                        ? 'linear-gradient(90deg, #7C3AED 0%, #D946EF 100%)'
                        : 'linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)',
                    },
                  }}
                />

                {/* Detailed Sub-stats Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                    Avg Views: <b>{formatCompactNumber(pt.avgViews)}</b> · Avg Likes: <b>{formatCompactNumber(pt.avgLikes)}</b>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                    Total: {formatCompactNumber(pt.views)} views ({formatCompactNumber(pt.likes)} likes)
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </GlassCard>
  );
};

export default PostTypeBreakdown;
