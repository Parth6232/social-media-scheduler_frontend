import { Box, CardContent, Typography, Grid, Chip, ButtonBase } from '@mui/material';
import { motion } from 'framer-motion';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MovieCreationIcon from '@mui/icons-material/MovieCreation';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { POST_RULES } from '../../config/postRules';
import { useTranslation } from '../../i18n/useTranslation';
import GlassCard from '../../common/components/motion/GlassCard';
import { StaggerContainer, StaggerItem } from '../../common/components/motion/Stagger';

const TYPE_CONFIG = {
  feed: {
    icon: <DynamicFeedIcon sx={{ fontSize: 26 }} />,
    color: '#2563EB',
    gradient: 'rgba(37,99,235,0.1)',
    borderHover: '#2563EB',
  },
  text: {
    icon: <TextFieldsIcon sx={{ fontSize: 26 }} />,
    color: '#0D9488',
    gradient: 'rgba(13,148,136,0.1)',
    borderHover: '#0D9488',
  },
  photo: {
    icon: <PhotoLibraryIcon sx={{ fontSize: 26 }} />,
    color: '#F59E0B',
    gradient: 'rgba(245,158,11,0.1)',
    borderHover: '#F59E0B',
  },
  reel: {
    icon: <MovieCreationIcon sx={{ fontSize: 26 }} />,
    color: '#E1306C',
    gradient: 'rgba(225,48,108,0.1)',
    borderHover: '#E1306C',
  },
  video: {
    icon: <VideoLibraryIcon sx={{ fontSize: 26 }} />,
    color: '#FF0000',
    gradient: 'rgba(255,0,0,0.1)',
    borderHover: '#FF0000',
  },
  facebookVideo: {
    icon: <SlowMotionVideoIcon sx={{ fontSize: 26 }} />,
    color: '#1877F2',
    gradient: 'rgba(24,119,242,0.1)',
    borderHover: '#1877F2',
  },
  story: {
    icon: <ViewDayIcon sx={{ fontSize: 26 }} />,
    color: '#1D4ED8',
    gradient: 'rgba(37,99,235,0.1)',
    borderHover: '#1D4ED8',
  },
};

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ fontSize: 14, color: '#FF0000' }} />,
  facebook: <FacebookIcon sx={{ fontSize: 14, color: '#1877F2' }} />,
  instagram: <InstagramIcon sx={{ fontSize: 14, color: '#E1306C' }} />,
};

const PLATFORM_NAMES = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

const PostTypeSelector = ({ onSelectType }) => {
  const { t } = useTranslation();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
        <motion.div
          
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37,99,235, 0.35)',
            }}
          >
            <AddCircleIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
        </motion.div>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t('chooseTypeTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
            {t('chooseTypeSubtitle')}
          </Typography>
        </Box>
      </Box>

      {/* Grid of post types — real 3D tilt cards on hover */}
      <StaggerContainer>
        <Grid container spacing={2.5}>
          {Object.entries(POST_RULES).map(([typeKey, rule]) => {
            const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.feed;
            const label = t(`postType_${typeKey}`) || rule.label;
            const platformsText = rule.allowedPlatforms
              .map((p) => PLATFORM_NAMES[p] || p)
              .join(', ');

            return (
              <Grid key={typeKey} size={{ xs: 12, sm: 6, md: 4 }}>
                <StaggerItem>
                  <ButtonBase
                    className="pp-type"
                    onClick={() => onSelectType(typeKey)}
                    sx={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'block',
                      borderRadius: 3,
                      outline: 'none',
                    }}
                  >
                    <GlassCard
                      hoverEffect
                      sx={{
                        height: '100%',
                        minHeight: 180,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: '100%',
                        '&:hover': {
                          borderColor: config.borderHover,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
                        {/* Top Row: Icon & badges */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                          <Box
                            className="pp-type-ico"
                            data-type={typeKey}
                            sx={{ perspective: 400,
                              width: 48,
                              height: 48,
                              borderRadius: 2.5,
                              background: config.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: config.color,
                              border: '1px solid',
                              borderColor: `${config.color}30`,
                              boxShadow: `0 4px 16px ${config.color}25`,
                            }}
                          >
                            {config.icon}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {rule.maxDurationSeconds && (
                              <Chip
                                size="small"
                                icon={<AccessTimeIcon sx={{ fontSize: '13px !important' }} />}
                                label={`≤ ${rule.maxDurationSeconds}s`}
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                                  color: '#EF4444',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                }}
                              />
                            )}
                            {rule.mediaType === 'none' && (
                              <Chip
                                size="small"
                                label="Text"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(13, 148, 136, 0.1)',
                                  color: '#0D9488',
                                  border: '1px solid rgba(13, 148, 136, 0.3)',
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Middle: Title & Supported Platforms */}
                        <Box sx={{ mb: 2, flex: 1 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: '1.05rem' }}>
                            {label}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              {rule.allowedPlatforms.map((p) => (
                                <Box key={p} sx={{ display: 'flex', alignItems: 'center' }}>
                                  {PLATFORM_ICONS[p]}
                                </Box>
                              ))}
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              {platformsText}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Bottom: Action hint */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            pt: 1,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <ArrowForwardIcon
                            className="arrow-icon"
                            sx={{
                              fontSize: 18,
                              color: 'text.secondary',
                              transition: 'all 0.2s ease',
                            }}
                          />
                        </Box>
                      </CardContent>
                    </GlassCard>
                  </ButtonBase>
                </StaggerItem>
              </Grid>
            );
          })}
        </Grid>
      </StaggerContainer>
    </Box>
  );
};

export default PostTypeSelector;
