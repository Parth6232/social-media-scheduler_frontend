// NEW: HealthAndUpcoming component for Post Health Status & Next Scheduled Queue
import { Box, Typography, CardContent, Chip, Grid, Button as MuiButton, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import PublicIcon from '@mui/icons-material/Public';

import GlassCard from '../../../common/components/motion/GlassCard';
import Counter from '../../../common/components/motion/Counter';
import { useTranslation } from '../../../i18n/useTranslation';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ color: '#FF0000', fontSize: 16 }} />,
  instagram: <InstagramIcon sx={{ color: '#E1306C', fontSize: 16 }} />,
  facebook: <FacebookIcon sx={{ color: '#1877F2', fontSize: 16 }} />,
};

const HealthAndUpcoming = ({
  health = { live: 0, removed: 0, unknown: 0 },
  upcoming = { count: 0, next: [] },
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const { live = 0, removed = 0, unknown = 0 } = health;
  const totalHealth = Math.max(1, live + removed + unknown);
  const livePct = Math.round((live / totalHealth) * 100);
  const removedPct = Math.round((removed / totalHealth) * 100);
  const unknownPct = Math.max(0, 100 - livePct - removedPct);

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* ── Left Column: Post Health ──────────────────────────────────── */}
      <Grid item xs={12} md={6}>
        <GlassCard sx={{ borderRadius: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
              {t('analytics_healthTitle')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 3 }}>
              Live availability status of published posts across social networks
            </Typography>

            {/* Health Stat Pills */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 3 }}>
              {/* Live */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#10B981' }}>
                    {t('analytics_statusLive')}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary' }}>
                  <Counter value={live} />
                </Typography>
              </Box>

              {/* Removed */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <DeleteOutlineIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#EF4444' }}>
                    {t('analytics_statusRemoved')}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary' }}>
                  <Counter value={removed} />
                </Typography>
              </Box>

              {/* Unknown */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <HelpOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary' }}>
                    {t('analytics_statusUnknown')}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary' }}>
                  <Counter value={unknown} />
                </Typography>
              </Box>
            </Box>

            {/* Stacked Progress Bar */}
            <Box sx={{ width: '100%', height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', mb: 2 }}>
              {livePct > 0 && <Box sx={{ width: `${livePct}%`, bgcolor: '#10B981' }} />}
              {removedPct > 0 && <Box sx={{ width: `${removedPct}%`, bgcolor: '#EF4444' }} />}
              {unknownPct > 0 && <Box sx={{ width: `${unknownPct}%`, bgcolor: isDark ? '#475569' : '#CBD5E1' }} />}
            </Box>

            {/* Removed Explanation note */}
            {removed > 0 && (
              <Typography variant="caption" sx={{ color: '#EF4444', mt: 'auto', display: 'block', pt: 1 }}>
                * {t('analytics_removedExplain')}
              </Typography>
            )}
          </CardContent>
        </GlassCard>
      </Grid>

      {/* ── Right Column: Upcoming Scheduled Queue ────────────────────── */}
      <Grid item xs={12} md={6}>
        <GlassCard sx={{ borderRadius: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
                  {t('analytics_upcomingTitle')}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Next queued posts waiting for automated publishing
                </Typography>
              </Box>

              <Chip
                icon={<EventAvailableIcon sx={{ fontSize: '14px !important' }} />}
                label={`${upcoming.count || 0} Queued`}
                size="small"
                sx={{
                  bgcolor: 'rgba(37,99,235, 0.15)',
                  color: '#2563EB',
                  border: '1px solid rgba(37,99,235, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>

            {upcoming.next?.length === 0 ? (
              <Box sx={{ my: 'auto', textAlign: 'center', py: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {t('analytics_noUpcoming')}
                </Typography>
                <MuiButton
                  variant="outlined"
                  onClick={() => navigate('/create')}
                  startIcon={<AddCircleIcon />}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: 'none',
                    borderColor: '#2563EB',
                    color: '#2563EB',
                    '&:hover': {
                      borderColor: '#2563EB',
                      bgcolor: 'rgba(37,99,235, 0.08)',
                    },
                  }}
                >
                  {t('analytics_schedulePostBtn')}
                </MuiButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
                {upcoming.next.map((post, idx) => {
                  const dateStr = post.scheduledAt ? new Date(post.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '';
                  const postTypeLabel = t(`postType_${post.postType}`) || post.postType;

                  return (
                    <Box
                      key={post.postId || idx}
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            color: 'text.primary',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.84rem',
                          }}
                        >
                          {post.content || '(Media only)'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                          <Chip
                            label={postTypeLabel}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {(post.platforms || []).map((p) => (
                              <span key={p}>{PLATFORM_ICONS[p] || <PublicIcon sx={{ fontSize: 14 }} />}</span>
                            ))}
                          </Box>
                        </Box>
                      </Box>

                      <Typography variant="caption" fontWeight={700} sx={{ color: '#2563EB', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {dateStr}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default HealthAndUpcoming;
