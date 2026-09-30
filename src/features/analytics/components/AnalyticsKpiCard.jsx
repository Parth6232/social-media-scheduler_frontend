// NEW: AnalyticsKpiCard component with Counter, Change Chip, Subtext, and Mini Sparkline
import { CardContent, Box, Typography, Chip, CircularProgress, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

import GlassCard from '../../../common/components/motion/GlassCard';
import Counter from '../../../common/components/motion/Counter';
import { useTranslation } from '../../../i18n/useTranslation';

const AnalyticsKpiCard = ({
  label,
  value,
  isPercentage = false,
  icon,
  color = '#8B5CF6',
  comparison, // { current, previous, changePct } | null
  invertComparisonColor = false, // for failed posts (increase is bad = red)
  subtext,
  sparklineData = [], // array of numbers
  progressValue = null, // for circular progress ring (e.g. success rate)
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Format sparkline data for recharts
  const chartPoints = sparklineData.map((v, i) => ({ idx: i, val: v || 0 }));

  // Comparison logic
  const hasComparison = comparison !== undefined && comparison !== null;
  const changePct = hasComparison ? comparison.changePct : null;
  const isNew = hasComparison && changePct === null;

  let isPositive = changePct !== null && changePct > 0;
  let isNegative = changePct !== null && changePct < 0;

  // Invert colors for bad metrics (e.g. failed posts)
  let trendColor = '#10B981'; // green
  if (invertComparisonColor) {
    if (isPositive) trendColor = '#EF4444'; // red
    else if (isNegative) trendColor = '#10B981'; // green
  } else {
    if (isPositive) trendColor = '#10B981'; // green
    else if (isNegative) trendColor = '#EF4444'; // red
  }

  return (
    <GlassCard
      sx={{
        borderRadius: 3.5,
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3.5,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
        {/* Header: Label + Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              fontSize: '0.72rem',
            }}
          >
            {label}
          </Typography>

          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: `${color}18`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${color}30`,
              boxShadow: `0 2px 8px ${color}20`,
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Main Number + Progress Ring / Sparkline */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color: 'text.primary',
                lineHeight: 1.1,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                letterSpacing: '-0.02em',
              }}
            >
              {value != null ? <Counter value={value} /> : '—'}
            </Typography>
            {isPercentage && value != null && (
              <Typography variant="h6" fontWeight={700} sx={{ color: 'text.secondary' }}>
                %
              </Typography>
            )}
          </Box>

          {/* Optional Circular Progress Ring for Success Rate */}
          {progressValue !== null && (
            <Box sx={{ position: 'relative', display: 'inline-flex', mr: 0.5 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={34}
                thickness={4.5}
                sx={{ color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
              />
              <CircularProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, progressValue))}
                size={34}
                thickness={4.5}
                sx={{
                  color: color,
                  position: 'absolute',
                  left: 0,
                  strokeLinecap: 'round',
                }}
              />
            </Box>
          )}
        </Box>

        {/* Footer: Trend Change Chip + Subtext */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minHeight: 24 }}>
          {hasComparison && (
            <>
              {isNew ? (
                <Chip
                  size="small"
                  label={t('analytics_newBadge')}
                  icon={<FiberNewIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(139, 92, 246, 0.15)',
                    color: '#8B5CF6',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                />
              ) : changePct !== null ? (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.3,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 1.5,
                    bgcolor: `${trendColor}15`,
                    color: trendColor,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: `1px solid ${trendColor}30`,
                  }}
                >
                  {isPositive ? (
                    <TrendingUpIcon sx={{ fontSize: 13 }} />
                  ) : isNegative ? (
                    <TrendingDownIcon sx={{ fontSize: 13 }} />
                  ) : null}
                  <span>
                    {changePct > 0 ? `+${changePct}%` : `${changePct}%`}
                  </span>
                </Box>
              ) : null}
            </>
          )}

          {subtext && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              {subtext}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Background Sparkline */}
      {chartPoints.length > 2 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 38,
            opacity: isDark ? 0.35 : 0.25,
            pointerEvents: 'none',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartPoints} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`kpi-spark-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke={color}
                strokeWidth={2}
                fill={`url(#kpi-spark-${label.replace(/\s+/g, '')})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </GlassCard>
  );
};

export default AnalyticsKpiCard;
