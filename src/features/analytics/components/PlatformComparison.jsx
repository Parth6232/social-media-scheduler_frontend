// NEW: PlatformComparison component with Grouped Bar Chart and Table/List
import { Box, Typography, CardContent, Chip, LinearProgress, useTheme } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import PublicIcon from '@mui/icons-material/Public';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import GlassCard from '../../../common/components/motion/GlassCard';
import { useTranslation } from '../../../i18n/useTranslation';
import { formatCompactNumber, formatFullNumber } from '../utils/analyticsFormatters';

const PLATFORM_CONFIG = {
  youtube: { label: 'YouTube', color: '#FF0000', icon: <YouTubeIcon sx={{ color: '#FF0000', fontSize: 18 }} /> },
  instagram: { label: 'Instagram', color: '#E1306C', icon: <InstagramIcon sx={{ color: '#E1306C', fontSize: 18 }} /> },
  facebook: { label: 'Facebook', color: '#1877F2', icon: <FacebookIcon sx={{ color: '#1877F2', fontSize: 18 }} /> },
};

const CustomPlatformTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        minWidth: 120,
      }}
    >
      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, my: 0.2 }}>
          <Typography variant="caption" sx={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}:
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
            {formatFullNumber(entry.value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const PlatformComparison = ({ platforms = [] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartData = platforms.map((p) => {
    const config = PLATFORM_CONFIG[p.platform] || { label: p.platform, color: '#8B5CF6' };
    return {
      name: config.label,
      platform: p.platform,
      views: p.views || 0,
      likes: p.likes || 0,
    };
  });

  return (
    <GlassCard sx={{ borderRadius: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
          {t('analytics_platformComparisonTitle')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
          Total engagement and success rate per platform
        </Typography>

        {/* Grouped Bar Chart */}
        {chartData.length > 0 ? (
          <Box sx={{ width: '100%', height: 200, mb: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                />
                <XAxis
                  dataKey="name"
                  stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatCompactNumber}
                  stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomPlatformTooltip isDark={isDark} />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                  formatter={(val) => <span style={{ color: isDark ? '#CBD5E1' : '#475569', fontWeight: 600 }}>{val}</span>}
                />
                <Bar dataKey="views" name={t('analytics_metricViews')} fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="likes" name={t('analytics_metricLikes')} fill="#D946EF" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : null}

        {/* Platform List & Stats Breakdown */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 'auto' }}>
          {platforms.map((p) => {
            const config = PLATFORM_CONFIG[p.platform] || {
              label: p.platform,
              color: '#8B5CF6',
              icon: <PublicIcon sx={{ fontSize: 18 }} />,
            };

            const successPct = p.successRate != null ? p.successRate : 100;

            return (
              <Box
                key={p.platform}
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Row Top: Icon + Name + Removed Chip + Targets */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {config.icon}
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                      {config.label}
                    </Typography>
                    {p.removed > 0 && (
                      <Chip
                        label={t('analytics_removedCount').replace('{count}', p.removed)}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: 'rgba(239, 68, 68, 0.15)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {p.published} {t('analytics_published').toLowerCase()} · {p.failed} {t('analytics_failed').toLowerCase()}
                  </Typography>
                </Box>

                {/* Progress bar for Success Rate */}
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      {t('analytics_successRate')}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: config.color, fontSize: '0.7rem' }}>
                      {successPct}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={successPct}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: config.color,
                      },
                    }}
                  />
                </Box>

                {/* Bottom Row: Avg stats */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Avg: <b style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>{p.avgViews}</b> views · <b style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>{p.avgLikes}</b> likes
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Total: <b style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>{formatCompactNumber(p.views)}</b> views
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

export default PlatformComparison;
