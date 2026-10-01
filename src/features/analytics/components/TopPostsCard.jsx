// NEW: TopPostsCard component displaying top performing posts with ranking and preview
import { Box, Typography, CardContent, Chip, IconButton, Tooltip, useTheme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import PublicIcon from '@mui/icons-material/Public';

import GlassCard from '../../../common/components/motion/GlassCard';
import { useTranslation } from '../../../i18n/useTranslation';
import { formatCompactNumber } from '../utils/analyticsFormatters';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ color: '#FF0000', fontSize: 18 }} />,
  instagram: <InstagramIcon sx={{ color: '#E1306C', fontSize: 18 }} />,
  facebook: <FacebookIcon sx={{ color: '#1877F2', fontSize: 18 }} />,
};

const TopPostsCard = ({ topPosts = [] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <GlassCard sx={{ borderRadius: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
          {t('analytics_topPostsTitle')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2.5 }}>
          Content generating the highest audience reach and engagement
        </Typography>

        {topPosts.length === 0 ? (
          <Box sx={{ my: 'auto', textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No top posts recorded in this period.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {topPosts.map((post, idx) => {
              const platformIcon = PLATFORM_ICONS[post.platform] || <PublicIcon sx={{ fontSize: 18 }} />;
              const postTypeLabel = t(`postType_${post.postType}`) || post.postType;
              const dateStr = post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : '';

              return (
                <Box
                  key={post.postId || idx}
                  sx={{
                    p: 1.8,
                    borderRadius: 2.5,
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {/* Rank Badge */}
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: idx === 0 ? 'rgba(245, 158, 11, 0.2)' : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      color: idx === 0 ? '#F59E0B' : 'text.secondary',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    #{idx + 1}
                  </Box>

                  {/* Platform Icon */}
                  <Box sx={{ flexShrink: 0 }}>{platformIcon}</Box>

                  {/* Content & Metadata */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {dateStr}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Stats (Views + Likes) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <VisibilityIcon sx={{ fontSize: 15, color: '#1D4ED8' }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
                        {formatCompactNumber(post.views)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <FavoriteIcon sx={{ fontSize: 15, color: '#F59E0B' }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
                        {formatCompactNumber(post.likes)}
                      </Typography>
                    </Box>

                    {/* Open External Link */}
                    {post.publishedUrl && (
                      <Tooltip title="View original post" arrow>
                        <IconButton
                          size="small"
                          component="a"
                          href={post.publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: 'text.secondary', '&:hover': { color: '#2563EB' } }}
                          aria-label="Open post"
                        >
                          <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </GlassCard>
  );
};

export default TopPostsCard;
