// NEW: PerformanceTimeline component with Segmented Metric Switch and Recharts
import { useState, useMemo } from 'react';
import { Box, Typography, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import GlassCard from '../../../common/components/motion/GlassCard';
import { useTranslation } from '../../../i18n/useTranslation';
import { formatDateLabel, formatFullNumber, formatCompactNumber } from '../utils/analyticsFormatters';

const METRIC_TABS = [
  { key: 'posts', labelKey: 'analytics_metricPosts' },
  { key: 'views', labelKey: 'analytics_metricViews' },
  { key: 'likes', labelKey: 'analytics_metricLikes' },
];

const CustomTimelineTooltip = ({ active, payload, label, granularity, t, isDark }) => {
  if (!active || !payload || !payload.length) return null;

  const dateFormatted = formatDateLabel(label, granularity);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.1)',
        minWidth: 140,
      }}
    >
      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 0.8 }}>
        {dateFormatted}
      </Typography>
      {payload.map((entry, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, my: 0.3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {entry.name}
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
            {formatFullNumber(entry.value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const PerformanceTimeline = ({ timeline = { granularity: 'day', points: [] } }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeMetric, setActiveMetric] = useState('posts');

  const { granularity, points = [] } = timeline;

  const chartData = useMemo(() => {
    return points.map((p) => ({
      date: p.date,
      published: p.published || 0,
      failed: p.failed || 0,
      targets: p.targets || 0,
      views: p.views || 0,
      likes: p.likes || 0,
    }));
  }, [points]);

  return (
    <GlassCard sx={{ mb: 4, borderRadius: 3.5, overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header with Title and Segmented Metric Switch */}
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
              {t('analytics_timelineTitle')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {granularity === 'day' ? 'Daily activity and performance trends' : 'Monthly activity and performance trends'}
            </Typography>
          </Box>

          {/* Segmented Metric Control */}
          <Box
            sx={{
              display: 'inline-flex',
              p: 0.5,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.04)',
            }}
          >
            {METRIC_TABS.map((tab) => {
              const isSelected = activeMetric === tab.key;
              return (
                <Box
                  key={tab.key}
                  component="button"
                  onClick={() => setActiveMetric(tab.key)}
                  sx={{
                    position: 'relative',
                    px: { xs: 1.5, sm: 2 },
                    py: 0.6,
                    borderRadius: 1.5,
                    border: 'none',
                    background: 'transparent',
                    color: isSelected ? '#ffffff' : 'text.secondary',
                    fontSize: '0.8rem',
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
                      layoutId="active-timeline-metric"
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
                  {t(tab.labelKey)}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Chart Canvas */}
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D946EF" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="likesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#D946EF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="publishedBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(val) => formatDateLabel(val, granularity)}
                stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }}
                tickLine={false}
                axisLine={false}
                minTickGap={isMobile ? 25 : 15}
              />

              <YAxis
                tickFormatter={formatCompactNumber}
                stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                content={<CustomTimelineTooltip granularity={granularity} t={t} isDark={isDark} />}
              />

              {activeMetric === 'posts' && (
                <>
                  <Bar
                    dataKey="published"
                    name={t('analytics_published')}
                    stackId="posts"
                    fill="url(#publishedBarGrad)"
                    radius={[0, 0, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="failed"
                    name={t('analytics_failed')}
                    stackId="posts"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </>
              )}

              {activeMetric === 'views' && (
                <Area
                  type="monotone"
                  dataKey="views"
                  name={t('analytics_metricViews')}
                  stroke="#D946EF"
                  strokeWidth={2.5}
                  fill="url(#viewsGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#D946EF', stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {activeMetric === 'likes' && (
                <Area
                  type="monotone"
                  dataKey="likes"
                  name={t('analytics_metricLikes')}
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fill="url(#likesGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </GlassCard>
  );
};

export default PerformanceTimeline;
