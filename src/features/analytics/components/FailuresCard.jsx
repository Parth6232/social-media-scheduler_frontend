// NEW: FailuresCard component summarizing failed targets, platform distribution, and error reasons
import { Box, Typography, CardContent, Chip, Tooltip, LinearProgress, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

import GlassCard from '../../../common/components/motion/GlassCard';
import { useTranslation } from '../../../i18n/useTranslation';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ color: '#FF0000', fontSize: 16 }} />,
  instagram: <InstagramIcon sx={{ color: '#E1306C', fontSize: 16 }} />,
  facebook: <FacebookIcon sx={{ color: '#1877F2', fontSize: 16 }} />,
};

const FailuresCard = ({ failures = { total: 0, byPlatform: [], reasons: [] } }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { total = 0, byPlatform = [], reasons = [] } = failures;

  return (
    <GlassCard sx={{ borderRadius: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
              {t('analytics_failuresTitle')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Detailed breakdown of publishing errors and delivery bottlenecks
            </Typography>
          </Box>

          <Chip
            label={t('analytics_failuresCount').replace('{count}', total)}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: total === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: total === 0 ? '#10B981' : '#EF4444',
              border: total === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          />
        </Box>

        {total === 0 ? (
          <Box sx={{ my: 'auto', textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
              {t('analytics_noFailures')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* By Platform Mini Bars */}
            {byPlatform.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  Failures by Platform
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {byPlatform.map((p) => {
                    const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
                    return (
                      <Box key={p.platform}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            {PLATFORM_ICONS[p.platform]}
                            <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                              {p.platform}
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={700} sx={{ color: '#EF4444' }}>
                            {p.count} ({pct}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2,
                              bgcolor: '#EF4444',
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Top Error Reasons List */}
            {reasons.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  Top Failure Reasons
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {reasons.map((r, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.4,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minWidth: 0, flexGrow: 1 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 16, color: '#EF4444', mt: 0.2, flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Tooltip title={r.reason} arrow>
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              sx={{
                                color: 'text.primary',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.3,
                              }}
                            >
                              {r.reason}
                            </Typography>
                          </Tooltip>

                          {/* Target platforms badges */}
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            {(r.platforms || []).map((plat) => (
                              <Chip
                                key={plat}
                                label={plat}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.62rem',
                                  textTransform: 'capitalize',
                                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>

                      <Chip
                        label={`${r.count}x`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: 'rgba(239, 68, 68, 0.12)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </GlassCard>
  );
};

export default FailuresCard;
