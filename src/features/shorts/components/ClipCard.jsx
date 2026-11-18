// NAYA: ClipCard — 9:16 video player + clip metadata + Download/CreatePost buttons
import { useRef, useState } from 'react';
import {
  Box, Typography, Chip, Tooltip, Skeleton
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../../../i18n/useTranslation';
import Button from '../../../common/Button';
import { showToast } from '../../../store/redux/slices/toastSlice';
import { localStore } from '../../../store/localStore';
import { appConstants } from '../../../constant/appConstants';
import { shortsApiAction } from '../shortsApiSlice';

// NAYA: seconds ko mm:ss format me convert
const fmtTime = (sec) => {
  if (sec == null) return '--:--';
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
};

// NAYA: bytes ko MB me convert
const fmtMB = (bytes) => {
  if (!bytes) return null;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// NAYA: layout key ka readable label
const LAYOUT_KEYS = {
  center: 'shorts_layoutCenter',
  follow_face: 'shorts_layoutFace',
  facecam_split: 'shorts_layoutSplit',
};

const ClipCard = ({ clip, jobId, isSkeleton, onPlayStart, onCreatePost }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [clipToPost] = shortsApiAction.useClipToPostMutation();
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // NAYA: video play shuru hone par doosre videos pause karo
  const handlePlay = () => {
    if (onPlayStart) onPlayStart(videoRef);
  };

  // NAYA: auth-aware download — fetch with Bearer token, blob save karo
  const handleDownload = async () => {
    if (!clip?.index == null || !jobId) return;
    setIsDownloading(true);
    try {
      const token = localStore.getToken();
      const url = `${appConstants.apiBaseURL}/shorts/jobs/${jobId}/clips/${clip.index}/download`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `postpilot_short_${clip.index + 1}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      dispatch(showToast({ message: 'Download started!', variant: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Download failed. Please try again.', variant: 'error' }));
    } finally {
      setIsDownloading(false);
    }
  };

  // NAYA: Create Post — clipToPost call karo, navigate parent ke zariye
  const handleCreatePost = async () => {
    if (!jobId || clip?.index == null) return;
    setIsCreatingPost(true);
    try {
      const result = await clipToPost({ jobId, index: clip.index }).unwrap();
      onCreatePost(result);
    } catch {
      dispatch(showToast({ message: 'Failed to prepare clip for posting.', variant: 'error' }));
    } finally {
      setIsCreatingPost(false);
    }
  };

  // NAYA: skeleton card — 9:16 placeholder
  if (isSkeleton) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton
          variant="rounded"
          sx={{ width: '100%', paddingTop: '177.78%', borderRadius: 3 }}
        />
        <Skeleton variant="text" width="80%" height={18} />
        <Skeleton variant="text" width="60%" height={14} />
      </Box>
    );
  }

  if (!clip) return null;

  const layoutKey = LAYOUT_KEYS[clip.layout] || clip.layout;

  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column',
        border: '1px solid', borderColor: 'divider',
        borderRadius: 3, overflow: 'hidden',
        bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: '#2563EB' },
      }}
    >
      {/* 9:16 Video Player */}
      <Box sx={{ position: 'relative', width: '100%', paddingTop: '177.78%', bgcolor: '#000', flexShrink: 0 }}>
        <Box
          component="video"
          ref={videoRef}
          src={clip.previewUrl}
          poster={clip.thumbUrl}
          controls
          playsInline
          preload="metadata"
          onPlay={handlePlay}
          aria-label={clip.title || `Clip ${clip.index + 1}`}
          sx={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Info */}
      <Box sx={{ p: 2, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ flex: 1, lineHeight: 1.3, fontSize: '0.85rem' }}
          >
            {clip.title || `Short ${clip.index + 1}`}
          </Typography>
          {clip.reason && (
            <Tooltip title={clip.reason} placement="top" arrow>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0, mt: 0.1 }} />
            </Tooltip>
          )}
        </Box>

        {/* Chips row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {/* Time range */}
          <Chip
            size="small"
            label={`${fmtTime(clip.start)} – ${fmtTime(clip.end)}`}
            sx={{ fontSize: '0.7rem', height: 22, fontFamily: 'monospace' }}
          />
          {/* Duration */}
          {clip.duration != null && (
            <Chip
              size="small"
              label={`${clip.duration}s`}
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          )}
          {/* Layout */}
          {clip.layout && (
            <Chip
              size="small"
              label={t(layoutKey)}
              sx={{ fontSize: '0.7rem', height: 22, bgcolor: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}
            />
          )}
          {/* File size */}
          {fmtMB(clip.sizeBytes) && (
            <Chip
              size="small"
              label={fmtMB(clip.sizeBytes)}
              sx={{ fontSize: '0.7rem', height: 22, color: 'text.secondary' }}
            />
          )}
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleDownload}
            loading={isDownloading}
            disabled={isDownloading || isCreatingPost}
            startIcon={<DownloadIcon />}
            sx={{
              flex: 1, borderRadius: 2, textTransform: 'none', fontSize: '0.78rem',
              borderColor: 'divider', '&:hover': { borderColor: '#2563EB', color: '#2563EB' },
            }}
          >
            {t('shorts_download')}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreatePost}
            loading={isCreatingPost}
            disabled={isDownloading || isCreatingPost}
            startIcon={<AddCircleIcon />}
            sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontSize: '0.78rem' }}
          >
            {t('shorts_createPost')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ClipCard;
