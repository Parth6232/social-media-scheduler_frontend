import { Box, Card, CardContent, Typography, Chip, Skeleton, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { appConstants } from '../../constant/appConstants';
import { postApiAction } from '../createPost/postApiSlice';
import { useTranslation } from '../../i18n/useTranslation';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ fontSize: 34 }} />,
  facebook: <FacebookIcon sx={{ fontSize: 34 }} />,
  instagram: <InstagramIcon sx={{ fontSize: 34 }} />,
  linkedin: <LinkedInIcon sx={{ fontSize: 34 }} />,
  twitter: <Box component="span" sx={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>𝕏</Box>,
  whatsapp: <WhatsAppIcon sx={{ fontSize: 34 }} />,
};

const PLATFORM_COLORS = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  twitter: '#1D9BF0',
  whatsapp: '#25D366',
};

const PostsPlatformGrid = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: summary, isLoading } = postApiAction.getPlatformSummary();

  const platformKeys = Object.keys(appConstants.platforms);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HistoryIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            {t('postsHistory')}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: { xs: 0, sm: 7 } }}>
          {t('platformSummarySubtitle')}
        </Typography>
      </Box>

      {/* Grid */}
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        {platformKeys.map((platformKey) => {
          const meta = appConstants.platforms[platformKey] || { name: platformKey, isComingSoon: false };
          const color = PLATFORM_COLORS[platformKey] || '#7C3AED';
          const platformStats = summary?.[platformKey] || { total: 0, published: 0, failed: 0, pending: 0 };
          const isComingSoon = meta.isComingSoon;

          const topStripBackground = platformKey === 'instagram'
            ? 'linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
            : color;

          if (isLoading) {
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={platformKey}>
                <Card sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                  <Skeleton variant="circular" width={44} height={44} sx={{ mb: 1.5 }} />
                  <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                  <Grid container spacing={1}>
                    <Grid size={6}><Skeleton variant="rounded" height={48} /></Grid>
                    <Grid size={6}><Skeleton variant="rounded" height={48} /></Grid>
                    <Grid size={6}><Skeleton variant="rounded" height={48} /></Grid>
                    <Grid size={6}><Skeleton variant="rounded" height={48} /></Grid>
                  </Grid>
                </Card>
              </Grid>
            );
          }

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={platformKey}>
              <Card
                onClick={() => {
                  if (!isComingSoon) {
                    navigate(`/posts/${platformKey}`);
                  }
                }}
                sx={{
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: isComingSoon ? 'default' : 'pointer',
                  opacity: isComingSoon ? 0.65 : 1,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:hover': isComingSoon ? {} : {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${color}25`,
                    borderColor: `${color}60`,
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {/* Top colored accent line */}
                {!isComingSoon && (
                  <Box sx={{ height: 3, background: topStripBackground }} />
                )}

                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Coming Soon Badge */}
                  {isComingSoon && (
                    <Chip
                      label={t('comingSoon')}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        color: 'text.secondary',
                        fontSize: '0.65rem',
                        height: 20,
                      }}
                    />
                  )}

                  {/* Icon & Name Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ color: isComingSoon ? 'text.secondary' : color, display: 'flex', alignItems: 'center' }}>
                        {PLATFORM_ICONS[platformKey]}
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        {meta.name}
                      </Typography>
                    </Box>
                    {!isComingSoon && (
                      <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.secondary', transition: 'transform 0.2s', '&:hover': { transform: 'translateX(3px)' } }} />
                    )}
                  </Box>

                  {/* Content / Stats */}
                  {isComingSoon ? (
                    <Box
                      sx={{
                        mt: 'auto',
                        minHeight: 114,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        borderRadius: 2,
                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('comingSoon')}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mt: 'auto' }}>
                      {/* Total */}
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
                          {t('totalPosts')}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, mt: 0.25 }}>
                          {platformStats.total || 0}
                        </Typography>
                      </Box>

                      {/* Published */}
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#10B981', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>
                          {t('statusPublished')}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#10B981', lineHeight: 1.2, mt: 0.25 }}>
                          {platformStats.published || 0}
                        </Typography>
                      </Box>

                      {/* Failed */}
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>
                          {t('statusFailed')}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#EF4444', lineHeight: 1.2, mt: 0.25 }}>
                          {platformStats.failed || 0}
                        </Typography>
                      </Box>

                      {/* Pending */}
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#F59E0B', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>
                          {t('statusPending')}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#F59E0B', lineHeight: 1.2, mt: 0.25 }}>
                          {platformStats.pending || 0}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PostsPlatformGrid;
