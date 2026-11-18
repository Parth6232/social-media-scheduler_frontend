// NAYA: SourceCard — YouTube URL input + fetched video info display
import { useState, useRef } from 'react';
import {
  Box, TextField, Typography, Chip, Alert, InputAdornment, Skeleton
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from '../../../i18n/useTranslation';
import Button from '../../../common/Button';
import GlassCard from '../../../common/components/motion/GlassCard';
import { shortsApiAction } from '../shortsApiSlice';

// NAYA: YouTube URL validate karo — watch, youtu.be, shorts format support
const isValidYouTubeUrl = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && (u.pathname.startsWith('/watch') || u.pathname.startsWith('/shorts'))) return true;
    if (u.hostname === 'youtu.be') return true;
    return false;
  } catch {
    return false;
  }
};

// NAYA: seconds ko mm:ss format me convert karo
const formatDuration = (sec) => {
  if (!sec && sec !== 0) return '--:--';
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
};

const SourceCard = ({ onSourceReady, disabled }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [urlError, setUrlError] = useState('');
  const pasteTimerRef = useRef(null);

  // NAYA: fetch source info trigger karo
  const [getSourceInfo] = shortsApiAction.useGetSourceInfoMutation();

  const handleFetch = async (fetchUrl) => {
    const target = fetchUrl ?? url;
    if (!target.trim()) return;
    if (!isValidYouTubeUrl(target.trim())) {
      setUrlError('Please enter a valid YouTube URL (watch, youtu.be, or /shorts).');
      return;
    }
    setUrlError('');
    setIsFetching(true);
    try {
      const info = await getSourceInfo({ url: target.trim() }).unwrap();
      setVideoInfo(info);
      onSourceReady({ url: target.trim(), info });
    } catch {
      setVideoInfo(null);
      onSourceReady(null);
    } finally {
      setIsFetching(false);
    }
  };

  // NAYA: paste pe auto-fetch trigger karo
  const handlePaste = (e) => {
    const pasted = e.clipboardData?.getData('text') || '';
    clearTimeout(pasteTimerRef.current);
    if (isValidYouTubeUrl(pasted.trim())) {
      pasteTimerRef.current = setTimeout(() => handleFetch(pasted.trim()), 300);
    }
  };

  const handleChange = (e) => {
    setUrl(e.target.value);
    if (urlError) setUrlError('');
    // Clear videoInfo if URL cleared
    if (!e.target.value.trim()) {
      setVideoInfo(null);
      onSourceReady(null);
    }
  };

  // NAYA: permission badge render
  const renderAuthBadge = () => {
    if (!videoInfo) return null;
    if (videoInfo.authorizedBy === 'owner') {
      return (
        <Chip
          size="small"
          icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
          label={t('shorts_badgeOwner')}
          sx={{ bgcolor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}
        />
      );
    }
    if (videoInfo.authorizedBy === 'creative_commons') {
      return (
        <Chip
          size="small"
          icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
          label={t('shorts_badgeCC')}
          sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.25)', fontWeight: 600 }}
        />
      );
    }
    return null;
  };

  return (
    <GlassCard sx={{ mb: 3, borderRadius: 3 }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LinkIcon sx={{ color: '#2563EB', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>YouTube Video</Typography>
        </Box>

        {/* URL Input row */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('shorts_urlPlaceholder')}
            value={url}
            onChange={handleChange}
            onPaste={handlePaste}
            disabled={disabled || isFetching}
            error={!!urlError}
            helperText={urlError || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            onClick={() => handleFetch()}
            loading={isFetching}
            disabled={disabled || !url.trim() || isFetching}
            sx={{ minWidth: 90, borderRadius: 2, flexShrink: 0 }}
          >
            {t('shorts_fetch')}
          </Button>
        </Box>

        {/* Helper text — rights note */}
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          {t('shorts_rightsNote')}
        </Typography>

        {/* Loading skeleton */}
        {isFetching && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Skeleton variant="rounded" width={120} height={68} sx={{ borderRadius: 2, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
              <Skeleton variant="text" width="30%" height={16} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        )}

        {/* Video info card */}
        {!isFetching && videoInfo && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex', gap: 2,
                p: 2, borderRadius: 2,
                border: '1px solid', borderColor: 'divider',
                bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}
            >
              {/* Thumbnail */}
              {videoInfo.thumbnail && (
                <Box
                  component="img"
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  sx={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0 }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    lineHeight: 1.35, mb: 0.5,
                  }}
                >
                  {videoInfo.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {videoInfo.channelTitle}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>
                    {formatDuration(videoInfo.durationSec)}
                  </Typography>
                  {renderAuthBadge()}
                </Box>
              </Box>
            </Box>

            {/* Unauthorized warning */}
            {videoInfo.authorized === false && (
              <Alert
                severity="warning"
                icon={<WarningAmberIcon fontSize="inherit" />}
                sx={{ mt: 1.5, borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.8rem' } }}
              >
                {videoInfo.authMessage}
              </Alert>
            )}
          </Box>
        )}
      </Box>
    </GlassCard>
  );
};

export default SourceCard;
