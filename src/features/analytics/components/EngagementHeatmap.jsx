// NEW: EngagementHeatmap component with CSS Grid, 7 Days x 24 Hours, and Aurora Gradient intensity
import { useMemo } from 'react';
import { Box, Typography, Tooltip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

import { useTranslation } from '../../../i18n/useTranslation';
import { formatHour, formatFullNumber } from '../utils/analyticsFormatters';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';

const DAYS_ORDER = [
  { dow: 1, label: 'Mon', full: 'Monday' },
  { dow: 2, label: 'Tue', full: 'Tuesday' },
  { dow: 3, label: 'Wed', full: 'Wednesday' },
  { dow: 4, label: 'Thu', full: 'Thursday' },
  { dow: 5, label: 'Fri', full: 'Friday' },
  { dow: 6, label: 'Sat', full: 'Saturday' },
  { dow: 0, label: 'Sun', full: 'Sunday' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const getCellLevel = (score, maxScore) => {
  if (!score || !maxScore || score <= 0) return 0;
  const ratio = score / maxScore;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};

const CELL_COLORS = {
  dark: {
    0: 'rgba(255, 255, 255, 0.04)',
    1: 'rgba(139, 92, 246, 0.28)',
    2: 'rgba(147, 51, 234, 0.52)',
    3: 'rgba(192, 38, 211, 0.78)',
    4: 'rgba(217, 70, 239, 1)',
  },
  light: {
    0: 'rgba(0, 0, 0, 0.04)',
    1: 'rgba(139, 92, 246, 0.25)',
    2: 'rgba(147, 51, 234, 0.48)',
    3: 'rgba(192, 38, 211, 0.72)',
    4: 'rgba(217, 70, 239, 0.95)',
  },
};

const EngagementHeatmap = ({ heatmap = { cells: [], maxScore: 0, totalPosts: 0 } }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();

  const { cells = [], maxScore = 1 } = heatmap;

  // Build a lookup map by `${dow}-${hour}`
  const cellMap = useMemo(() => {
    const map = new Map();
    cells.forEach((c) => {
      map.set(`${c.dayOfWeek}-${c.hour}`, c);
    });
    return map;
  }, [cells]);

  // Find the single absolute best cell
  const bestCell = useMemo(() => {
    if (!cells.length) return null;
    return [...cells].sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))[0];
  }, [cells]);

  const palette = isDark ? CELL_COLORS.dark : CELL_COLORS.light;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
      <Box sx={{ minWidth: 620, p: 0.5 }}>
        {/* Hour Header Labels (Labels every 3 hours) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '45px repeat(24, 1fr)', gap: '4px', mb: 1 }}>
          <Box />
          {HOURS.map((h) => {
            const isLabel = h % 3 === 0;
            return (
              <Typography
                key={h}
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {isLabel ? (h === 0 ? '12a' : h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`) : ''}
              </Typography>
            );
          })}
        </Box>

        {/* 7 Rows of Days */}
        {DAYS_ORDER.map((day, rowIdx) => (
          <Box
            key={day.dow}
            sx={{
              display: 'grid',
              gridTemplateColumns: '45px repeat(24, 1fr)',
              gap: '4px',
              alignItems: 'center',
              mb: '4px',
            }}
          >
            {/* Day Name Label */}
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            >
              {day.label}
            </Typography>

            {/* 24 Hour Cells */}
            {HOURS.map((hour, colIdx) => {
              const data = cellMap.get(`${day.dow}-${hour}`);
              const level = data ? getCellLevel(data.avgScore, maxScore) : 0;
              const isBest =
                bestCell &&
                bestCell.dayOfWeek === day.dow &&
                bestCell.hour === hour &&
                bestCell.avgScore > 0;

              const tooltipTitle = data ? (
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#fff', display: 'block' }}>
                    {day.full}, {formatHour(hour)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}>
                    {data.posts} {data.posts === 1 ? 'post' : 'posts'} · avg {formatFullNumber(data.avgViews)} views · {formatFullNumber(data.avgLikes)} likes
                  </Typography>
                </Box>
              ) : (
                `${day.full}, ${formatHour(hour)}: No posts`
              );

              return (
                <Tooltip key={hour} title={tooltipTitle} arrow placement="top">
                  <Box
                    tabIndex={0}
                    aria-label={`${day.full}, ${formatHour(hour)}`}
                    component={motion.div}
                    initial={reduced ? {} : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.25,
                      delay: reduced ? 0 : (rowIdx * 0.03 + colIdx * 0.015),
                    }}
                    whileHover={{ scale: 1.25, zIndex: 5 }}
                    sx={{
                      height: 22,
                      borderRadius: 1,
                      bgcolor: palette[level],
                      cursor: 'pointer',
                      border: isBest
                        ? '2px solid #22D3EE'
                        : isDark
                        ? '1px solid rgba(255,255,255,0.06)'
                        : '1px solid rgba(0,0,0,0.06)',
                      boxShadow: isBest ? '0 0 10px rgba(34, 211, 238, 0.6)' : undefined,
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      '&:focus-visible': {
                        outline: '2px solid #8B5CF6',
                        zIndex: 10,
                      },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        ))}

        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            {t('analytics_heatmapLegendLess')}
          </Typography>
          <Box sx={{ display: 'flex', gap: '3px' }}>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <Box
                key={lvl}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '2px',
                  bgcolor: palette[lvl],
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            {t('analytics_heatmapLegendMore')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default EngagementHeatmap;
