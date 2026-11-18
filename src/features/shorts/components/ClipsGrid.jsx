// NAYA: ClipsGrid — 3 clips ka grid, header actions, skeleton placeholders
import { useRef, useCallback } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplayIcon from '@mui/icons-material/Replay';
import { useTranslation } from '../../../i18n/useTranslation';
import Button from '../../../common/Button';
import ClipCard from './ClipCard';

const TOTAL_CLIPS = 3;

const ClipsGrid = ({ job, onRegenerate, onStartOver, onCreatePost, isRegenerating }) => {
  const { t } = useTranslation();
  const videoRefs = useRef([]);

  // NAYA: ek video play karo, baaki sab pause karo (one-at-a-time)
  const handlePlayStart = useCallback((playingRef) => {
    videoRefs.current.forEach((ref) => {
      if (ref && ref !== playingRef.current && !ref.paused) {
        ref.pause();
      }
    });
  }, []);

  const setVideoRef = (el, idx) => {
    videoRefs.current[idx] = el;
  };

  const clips = job?.clips || [];
  const totalExpected = TOTAL_CLIPS;
  const isDone = job?.status === 'done';
  const isRendering = job?.status === 'rendering';

  // NAYA: render karo: existing clips + skeleton placeholders baki ke liye
  const cards = Array.from({ length: totalExpected }, (_, i) => {
    const clip = clips[i];
    // Show skeleton if: not done and clip not yet received
    const isSkeleton = !clip && (isRendering || !isDone);
    return { clip, isSkeleton, idx: i };
  });

  return (
    <Box>
      {/* Grid header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {clips.length > 0 ? `${clips.length} Short${clips.length !== 1 ? 's' : ''} Ready` : 'Generating...'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRegenerate}
            loading={isRegenerating}
            sx={{
              borderRadius: 2, textTransform: 'none', fontSize: '0.78rem',
              borderColor: 'divider', '&:hover': { borderColor: '#2563EB', color: '#2563EB' },
            }}
          >
            {t('shorts_generateNew')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ReplayIcon />}
            onClick={onStartOver}
            disabled={isRegenerating}
            sx={{
              borderRadius: 2, textTransform: 'none', fontSize: '0.78rem',
              borderColor: 'divider', '&:hover': { borderColor: '#2563EB', color: '#2563EB' },
            }}
          >
            {t('shorts_newVideo')}
          </Button>
        </Box>
      </Box>

      {/* 3-column on desktop, 1-column on mobile */}
      <Grid container spacing={2}>
        {cards.map(({ clip, isSkeleton, idx }) => (
          <Grid
            key={idx}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            {isSkeleton ? (
              <ClipCard isSkeleton />
            ) : clip ? (
              <ClipCard
                clip={clip}
                jobId={job?.id}
                isSkeleton={false}
                onPlayStart={(ref) => {
                  // NAYA: sab videos pause karo — play wala chhodke
                  videoRefs.current.forEach((el, i) => {
                    if (el && i !== idx && !el.paused) el.pause();
                  });
                }}
                onCreatePost={onCreatePost}
              />
            ) : null}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClipsGrid;
