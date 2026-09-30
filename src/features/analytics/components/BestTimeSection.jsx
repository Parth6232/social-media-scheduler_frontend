// NEW: BestTimeSection component featuring Heatmap, Slots, and Hourly/Daily Bar Charts
import { useMemo } from 'react';
import { Box, Typography, CardContent, Chip, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

import GlassCard from '../../../common/components/motion/GlassCard';
import EngagementHeatmap from './EngagementHeatmap';
import { useTranslation } from '../../../i18n/useTranslation';
import { formatHour, formatCompactNumber } from '../utils/analyticsFormatters';

const CustomMiniTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];

  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1.5,
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
        Score: {entry.value}
      </Typography>
    </Box>
  );
};

const BestTimeSection = ({
  bestTime = null,
  heatmap = { cells: [], maxScore: 0, totalPosts: 0, byHour: [], byDay: [] },
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const isPersonalized = bestTime?.source === 'your_data';
  const slots = bestTime?.slots || [];
  const { byHour = [], byDay = [], totalPosts = 0 } = heatmap;

  // Find max scores for hourly/daily highlighting
  const maxHourScore = useMemo(() => Math.max(...byHour.map((h) => h.avgScore || 0), 1), [byHour]);
  const maxDayScore = useMemo(() => Math.max(...byDay.map((d) => d.avgScore || 0), 1), [byDay]);

  const hourChartData = useMemo(() => {
    return byHour.map((h) => ({
      name: formatHour(h.hour),
      hour: h.hour,
      score: h.avgScore || 0,
      isBest: h.avgScore > 0 && h.avgScore === maxHourScore,
    }));
  }, [byHour, maxHourScore]);

  const dayChartData = useMemo(() => {
    return byDay.map((d) => ({
      name: d.dayName ? d.dayName.slice(0, 3) : `Day ${d.dayOfWeek}`,
      dayOfWeek: d.dayOfWeek,
      score: d.avgScore || 0,
      isBest: d.avgScore > 0 && d.avgScore === maxDayScore,
    }));
  }, [byDay, maxDayScore]);

  return (
    <GlassCard sx={{ mb: 4, borderRadius: 3.5 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3.5 } }}>
        {/* Header & Source Badge */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary' }}>
                {t('analytics_bestTimeTitle')}
              </Typography>
              <Chip
                icon={isPersonalized ? <AutoAwesomeIcon sx={{ fontSize: '13px !important' }} /> : undefined}
                label={
                  isPersonalized
                    ? t('analytics_basedOnPosts').replace('{count}', bestTime.basedOnPosts || totalPosts)
                    : t('analytics_generalBestTimes')
                }
                size="small"
                sx={{
                  bgcolor: isPersonalized ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  color: isPersonalized ? '#8B5CF6' : 'text.secondary',
                  border: isPersonalized ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
            {!isPersonalized && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                {t('analytics_generalHint')}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Recommended Slot Chips */}
        {slots.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
              Recommended Posting Windows
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {slots.map((slot, idx) => {
                const isTop = idx === 0;
                return (
                  <Box
                    key={idx}
                    onClick={() => navigate('/create')}
                    sx={{
                      p: 1.5,
                      px: 2,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      bgcolor: isTop
                        ? isDark
                          ? 'rgba(124, 58, 237, 0.18)'
                          : 'rgba(124, 58, 237, 0.08)'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.03)',
                      border: isTop
                        ? '1px solid rgba(124, 58, 237, 0.45)'
                        : isDark
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.2s',
                      boxShadow: isTop ? '0 4px 14px rgba(124, 58, 237, 0.2)' : undefined,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: '#8B5CF6',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: isTop ? '#8B5CF6' : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)',
                        color: isTop ? '#fff' : 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isTop ? <StarIcon sx={{ fontSize: 16 }} /> : <AccessTimeFilledIcon sx={{ fontSize: 16 }} />}
                    </Box>

                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                        {slot.label || `${slot.dayName}, ${formatHour(slot.hour)}`}
                      </Typography>
                      {slot.avgViews ? (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          avg {formatCompactNumber(slot.avgViews)} views · {slot.avgLikes} likes
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#8B5CF6', fontSize: '0.7rem', fontWeight: 600 }}>
                          {t('analytics_scheduleAtSlot')} →
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Heatmap Section */}
        {totalPosts === 0 ? (
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              border: isDark ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px dashed rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              my: 2,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto' }}>
              {t('analytics_heatmapEmpty')}
            </Typography>
          </Box>
        ) : (
          <EngagementHeatmap heatmap={heatmap} />
        )}

        {/* Hourly & Daily Mini Bar Charts */}
        {totalPosts > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* By Hour */}
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  {t('analytics_byHourTitle')}
                </Typography>
                <Box sx={{ width: '100%', height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                        tick={{ fontSize: 9, fill: isDark ? '#94A3B8' : '#64748B' }}
                        interval={3}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomMiniTooltip isDark={isDark} />} />
                      <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                        {hourChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isBest ? '#22D3EE' : isDark ? 'rgba(139, 92, 246, 0.45)' : 'rgba(139, 92, 246, 0.35)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>

            {/* By Day */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  {t('analytics_byDayTitle')}
                </Typography>
                <Box sx={{ width: '100%', height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                        tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomMiniTooltip isDark={isDark} />} />
                      <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                        {dayChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isBest ? '#D946EF' : isDark ? 'rgba(192, 38, 211, 0.45)' : 'rgba(192, 38, 211, 0.35)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </GlassCard>
  );
};

export default BestTimeSection;
