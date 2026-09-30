// NEW: PostStatusDonut component displaying post status breakdown in a sleek donut chart
import { useMemo } from 'react';
import { Box, Typography, CardContent, useTheme } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import GlassCard from '../../../common/components/motion/GlassCard';
import { useTranslation } from '../../../i18n/useTranslation';
import Counter from '../../../common/components/motion/Counter';

const STATUS_CONFIG = {
  completed: { labelKey: 'statusCompleted', color: '#10B981' },
  published: { labelKey: 'statusPublished', color: '#10B981' },
  processing: { labelKey: 'statusProcessing', color: '#3B82F6' },
  pending: { labelKey: 'statusPending', color: '#F59E0B' },
  partial: { labelKey: 'statusPartial', color: '#8B5CF6' },
  failed: { labelKey: 'statusFailed', color: '#EF4444' },
};

const CustomDonutTooltip = ({ active, payload, t, isDark }) => {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];

  return (
    <Box
      sx={{
        p: 1.2,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.payload.fill }} />
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
          {entry.name}: {entry.value} ({entry.payload.percent}%)
        </Typography>
      </Box>
    </Box>
  );
};

const PostStatusDonut = ({ postStatus = {} }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const total = Object.values(postStatus).reduce((a, b) => a + (b || 0), 0);

  const data = useMemo(() => {
    return Object.entries(postStatus)
      .filter(([_, count]) => count > 0)
      .map(([statusKey, count]) => {
        const config = STATUS_CONFIG[statusKey] || { labelKey: statusKey, color: '#8B5CF6' };
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          name: t(config.labelKey) || statusKey,
          value: count,
          percent,
          color: config.color,
        };
      });
  }, [postStatus, total, t]);

  return (
    <GlassCard sx={{ borderRadius: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
          {t('analytics_postStatusTitle')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
          Overall lifecycle status across scheduled and published posts
        </Typography>

        {/* Center Donut Chart */}
        <Box sx={{ position: 'relative', width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomDonutTooltip t={t} isDark={isDark} />} />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Total Posts Overlay in Donut Center */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1 }}>
                  <Counter value={total} />
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
                  {t('analytics_totalPosts')}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              No status data available
            </Typography>
          )}
        </Box>

        {/* Custom Legend Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 'auto', pt: 2 }}>
          {data.map((item) => (
            <Box
              key={item.name}
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: 'text.primary' }}>
                  {item.name}
                </Typography>
              </Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary' }}>
                {item.value} ({item.percent}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </GlassCard>
  );
};

export default PostStatusDonut;
