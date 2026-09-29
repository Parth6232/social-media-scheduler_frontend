// NEW: best time to post — Feature 1
import { Box, Typography, Chip, Skeleton, Tooltip, Badge } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../store/redux/slices/toastSlice';
import { postApiAction } from '../postApiSlice';
import { useTranslation } from '../../../i18n/useTranslation';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

const SkeletonChip = () => (
  <Skeleton
    variant="rounded"
    width={120}
    height={36}
    sx={{ borderRadius: '16px', transform: 'none' }}
  />
);

const BestTimeSuggestions = ({
  selectedPlatforms,
  scheduledAt,
  setScheduleEnabled,
  setScheduledAt,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reduced = usePrefersReducedMotion();

  // Pass single platform if exactly one selected
  const platformArg =
    selectedPlatforms.length === 1 ? selectedPlatforms[0] : undefined;

  const { data, isLoading, isError } = postApiAction.getBestTime(platformArg, {
    refetchOnMountOrArgChange: true,
  });

  if (isError) return null;

  const slots = data?.slots?.slice(0, 3) ?? [];

  const isSlotSelected = (slot) => {
    if (!scheduledAt) return false;
    return new Date(slot.nextAt).getTime() === new Date(scheduledAt).getTime();
  };

  const handleChipClick = (slot) => {
    setScheduleEnabled(true);
    setScheduledAt(new Date(slot.nextAt));
    dispatch(
      showToast({
        message: t('bestTime_timeSet').replace('{label}', slot.label),
        variant: 'success',
      })
    );
  };

  const showISTNote = BROWSER_TZ !== 'Asia/Kolkata';

  const chipVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: reduced
        ? {}
        : { delay: i * 0.08, type: 'spring', stiffness: 280, damping: 22 },
    }),
  };

  const pulseAnimation = reduced
    ? {}
    : {
        animate: {
          boxShadow: [
            '0 0 0px rgba(139,92,246,0)',
            '0 0 14px rgba(139,92,246,0.55)',
            '0 0 0px rgba(139,92,246,0)',
          ],
        },
        transition: { duration: 2, repeat: Infinity },
      };

  return (
    <Box sx={{ mt: 2.5 }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <AccessTimeIcon sx={{ color: '#A78BFA', fontSize: 17 }} />
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: 0.3 }}>
          {t('bestTime_title')}
        </Typography>

        {!isLoading && data && (
          <Chip
            icon={
              data.source === 'your_data' ? (
                <AutoAwesomeIcon sx={{ fontSize: 12, color: '#D946EF !important' }} />
              ) : undefined
            }
            label={
              data.source === 'your_data'
                ? `${t('bestTime_basedOnYours')} (${data.basedOnPosts})`
                : t('bestTime_generalTimes')
            }
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(217,70,239,0.12)'
                  : 'rgba(217,70,239,0.08)',
              color: '#D946EF',
              border: '1px solid rgba(217,70,239,0.3)',
              '& .MuiChip-icon': { fontSize: 12 },
            }}
          />
        )}
      </Box>

      {/* Slot chips row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        {isLoading ? (
          <>
            <SkeletonChip />
            <SkeletonChip />
            <SkeletonChip />
          </>
        ) : (
          <AnimatePresence>
            {slots.map((slot, i) => {
              const selected = isSlotSelected(slot);
              const isBest = i === 0;

              return (
                <motion.div
                  key={slot.nextAt}
                  custom={i}
                  variants={chipVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={reduced ? {} : { y: -3, scale: 1.04 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  {...(selected ? pulseAnimation : {})}
                  style={{ display: 'inline-flex', borderRadius: 16 }}
                >
                  <Tooltip
                    title={
                      data?.source === 'your_data'
                        ? `${t('bestTime_avgViews').replace('{views}', slot.avgViews ?? 0)} · ${t('bestTime_avgLikes').replace('{likes}', slot.avgLikes ?? 0)}`
                        : ''
                    }
                    arrow
                  >
                    <Chip
                      aria-label={`${t('bestTime_title')}: ${slot.label}`}
                      icon={
                        isBest ? (
                          <StarIcon
                            sx={{
                              fontSize: '14px !important',
                              color: selected
                                ? 'rgba(255,255,255,0.9) !important'
                                : '#FBBF24 !important',
                            }}
                          />
                        ) : undefined
                      }
                      label={
                        <Box>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{ display: 'block', lineHeight: 1.3, fontSize: '0.72rem' }}
                          >
                            {slot.label}
                          </Typography>
                          {data?.source === 'your_data' && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.58rem',
                                opacity: 0.8,
                                display: 'block',
                                lineHeight: 1.2,
                              }}
                            >
                              {slot.avgViews ?? 0} views · {slot.avgLikes ?? 0} likes
                            </Typography>
                          )}
                        </Box>
                      }
                      clickable
                      onClick={() => handleChipClick(slot)}
                      sx={{
                        height: 'auto',
                        py: 0.5,
                        px: 0.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        border: selected
                          ? '1.5px solid #8B5CF6'
                          : isBest
                          ? '1px solid rgba(251,191,36,0.4)'
                          : '1px solid',
                        borderColor: selected
                          ? '#8B5CF6'
                          : isBest
                          ? 'rgba(251,191,36,0.4)'
                          : 'divider',
                        background: selected
                          ? 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)'
                          : (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.04)'
                                : 'rgba(0,0,0,0.03)',
                        color: selected ? '#fff' : 'text.primary',
                        transition: 'all 0.25s ease',
                        boxShadow: selected ? '0 0 10px rgba(139,92,246,0.4)' : 'none',
                        '& .MuiChip-label': { px: 0.75 },
                        '& .MuiChip-icon': { ml: '4px' },
                      }}
                    />
                  </Tooltip>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </Box>

      {/* IST note */}
      {!isLoading && slots.length > 0 && showISTNote && (
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', fontSize: '0.6rem', mt: 0.75, display: 'block' }}
        >
          {t('bestTime_istNote')}
        </Typography>
      )}
    </Box>
  );
};

export default BestTimeSuggestions;
