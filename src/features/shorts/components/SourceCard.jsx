// NAYA: SourceCard — YouTube URL input & Direct Video Upload with 2-Tab Switcher
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, TextField, Typography, Chip, Alert, InputAdornment, Skeleton, ButtonBase
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../../../i18n/useTranslation';
import Button from '../../../common/Button';
import GlassCard from '../../../common/components/motion/GlassCard';
import { showToast } from '../../../store/redux/slices/toastSlice';
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

// NAYA: bytes ko MB format me convert karo (e.g. 45.2 MB)
const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB

const SourceCard = ({ onSourceReady, disabled, resetKey }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Tab mode: 'youtube' (default) vs 'upload'
  const [mode, setMode] = useState('youtube');

  // YouTube tab state
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [urlError, setUrlError] = useState('');
  const pasteTimerRef = useRef(null);

  // Upload tab state
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const previewUrlRef = useRef(null);
  const durationRef = useRef(null); // upload ki video ki lambai (seconds) — range check ke liye

  // RTK Query source-info mutation
  const [getSourceInfo] = shortsApiAction.useGetSourceInfoMutation();

  // Reset when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined) {
      setUrl('');
      setVideoInfo(null);
      setUrlError('');
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setVideoFile(null);
      setVideoTitle('');
      setVideoPreviewUrl(null);
    }
  }, [resetKey]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Mode change handler
  const handleModeChange = (newMode) => {
    if (newMode === mode || disabled) return;
    setMode(newMode);
    if (newMode === 'youtube') {
      if (url.trim() && videoInfo) {
        onSourceReady({ mode: 'youtube', url: url.trim(), info: videoInfo });
      } else {
        onSourceReady(null);
      }
    } else {
      if (videoFile) {
        onSourceReady({
          mode: 'upload',
          file: videoFile,
          title: videoTitle || videoFile.name.replace(/\.[^/.]+$/, ''),
          previewUrl: videoPreviewUrl,
          size: videoFile.size,
          durationSec: durationRef.current,
        });
      } else {
        onSourceReady(null);
      }
    }
  };

  // ── YouTube handlers ──
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
      onSourceReady({ mode: 'youtube', url: target.trim(), info });
    } catch {
      setVideoInfo(null);
      onSourceReady(null);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData?.getData('text') || '';
    clearTimeout(pasteTimerRef.current);
    if (isValidYouTubeUrl(pasted.trim())) {
      pasteTimerRef.current = setTimeout(() => handleFetch(pasted.trim()), 300);
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (urlError) setUrlError('');
    if (!e.target.value.trim()) {
      setVideoInfo(null);
      onSourceReady(null);
    }
  };

  // ── Upload handlers ──
  const onDropVideo = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections && fileRejections.length > 0) {
      const err = fileRejections[0]?.errors?.[0];
      if (err?.code === 'file-too-large') {
        dispatch(showToast({ message: 'Video file exceeds 500MB limit.', variant: 'warning' }));
      } else {
        dispatch(showToast({ message: 'Please upload an MP4, MOV, or WEBM video file (up to 500MB).', variant: 'warning' }));
      }
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const preview = URL.createObjectURL(file);
    durationRef.current = null;
    previewUrlRef.current = preview;

    const defaultTitle = file.name.replace(/\.[^/.]+$/, '');
    setVideoFile(file);
    setVideoPreviewUrl(preview);
    setVideoTitle(defaultTitle);

    onSourceReady({
      mode: 'upload',
      file,
      title: defaultTitle,
      previewUrl: preview,
      size: file.size,
      durationSec: null,
    });
  }, [dispatch, onSourceReady]);

  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDrag,
    open: openVideoPicker,
  } = useDropzone({
    onDrop: onDropVideo,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/webm': ['.webm'],
    },
    maxFiles: 1,
    maxSize: MAX_VIDEO_BYTES,
    disabled,
  });

  const handleRemoveVideo = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoTitle('');
    onSourceReady(null);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setVideoTitle(val);
    if (videoFile) {
      onSourceReady({
        mode: 'upload',
        file: videoFile,
        title: val,
        previewUrl: videoPreviewUrl,
        size: videoFile.size,
          durationSec: durationRef.current,
      });
    }
  };

  // Browser ne video ki lambai bata di => parent ko do (60 min se lambi ho to range zaroori)
  const handleVideoMeta = (e) => {
    const d = e.target.duration;
    if (!videoFile || !Number.isFinite(d)) return;
    durationRef.current = d;
    onSourceReady({
      mode: 'upload',
      file: videoFile,
      title: videoTitle || videoFile.name.replace(/\.[^/.]+$/, ''),
      previewUrl: videoPreviewUrl,
      size: videoFile.size,
      durationSec: d,
    });
  };

  // Permission badge for YouTube video
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
        {/* Source Mode Switcher: 2-tab switch */}
        <Box
          sx={{
            display: 'flex',
            p: 0.5,
            borderRadius: 2.5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            border: '1px solid',
            borderColor: 'divider',
            mb: 2.5,
            gap: 0.5,
          }}
        >
          {/* Tab 1: YouTube Link */}
          <ButtonBase
            onClick={() => handleModeChange('youtube')}
            disabled={disabled}
            sx={{
              flex: 1,
              py: 1,
              px: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(mode === 'youtube'
                ? {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.25)' : '#2563EB',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(37, 99, 235, 0.4)' : 'none',
                  }
                : {
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    },
                  }),
            }}
          >
            <span>🔗</span>
            <span>{t('shorts_tabYoutube') || 'YouTube Link'}</span>
          </ButtonBase>

          {/* Tab 2: Upload Video File */}
          <ButtonBase
            onClick={() => handleModeChange('upload')}
            disabled={disabled}
            sx={{
              flex: 1,
              py: 1,
              px: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(mode === 'upload'
                ? {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.25)' : '#2563EB',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(37, 99, 235, 0.4)' : 'none',
                  }
                : {
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    },
                  }),
            }}
          >
            <span>📁</span>
            <span>{t('shorts_tabUpload') || 'Upload Video File'}</span>
          </ButtonBase>
        </Box>

        {/* ── TAB 1 VIEW: YouTube Link ── */}
        {mode === 'youtube' && (
          <Box>
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
                onChange={handleUrlChange}
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
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
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
        )}

        {/* ── TAB 2 VIEW: Upload Video File ── */}
        {mode === 'upload' && (
          <Box>
            {!videoFile ? (
              /* Drag & Drop Upload Box */
              <Box
                {...getVideoRootProps()}
                sx={{
                  p: 4,
                  borderRadius: 2.5,
                  border: '2px dashed',
                  borderColor: isVideoDrag ? '#2563EB' : 'divider',
                  bgcolor: isVideoDrag
                    ? 'rgba(37, 99, 235, 0.08)'
                    : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: disabled ? 'divider' : '#2563EB',
                    bgcolor: disabled ? 'transparent' : (theme) => theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.04)' : 'rgba(37,99,235,0.02)',
                  },
                }}
              >
                <input {...getVideoInputProps()} />
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                    {t('shorts_uploadDragText') || 'Drag & drop a video file here, or browse'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {t('shorts_uploadLimits') || 'MP4, MOV, or WEBM up to 500MB'}
                  </Typography>
                </Box>
              </Box>
            ) : (
              /* Uploaded Video Details + Preview + Controls */
              <Box>
                {/* Small <video> preview */}
                {videoPreviewUrl && (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: '#000',
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      component="video"
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={handleVideoMeta}
                      sx={{
                        width: '100%',
                        maxHeight: 220,
                        display: 'block',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                )}

                {/* File name & size row with Change / Remove actions */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    mb: 2,
                    gap: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                    <VideoFileIcon sx={{ color: '#2563EB', fontSize: 26, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        noWrap
                        sx={{ fontSize: '0.84rem' }}
                        title={videoFile.name}
                      >
                        {videoFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {formatFileSize(videoFile.size)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Remove / Change Video buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={openVideoPicker}
                      disabled={disabled}
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
                    >
                      {t('shorts_changeVideo') || 'Change Video'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleRemoveVideo}
                      disabled={disabled}
                      startIcon={<DeleteOutlinedIcon sx={{ fontSize: 16 }} />}
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
                    >
                      {t('shorts_removeVideo') || 'Remove'}
                    </Button>
                  </Box>
                </Box>

                {/* Optional Video Title input */}
                <TextField
                  fullWidth
                  size="small"
                  label={t('shorts_videoTitleLabel') || 'Video Title (Optional)'}
                  value={videoTitle}
                  onChange={handleTitleChange}
                  placeholder={videoFile.name.replace(/\.[^/.]+$/, '')}
                  helperText={t('shorts_videoTitleHelper') || 'Defaults to filename without extension'}
                  disabled={disabled}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </GlassCard>
  );
};

export default SourceCard;
