import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, IconButton, List, ListItem, ListItemText, ListItemAvatar,
  Avatar, TextField, Tabs, Tab, CircularProgress, Chip, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import { useTranslation } from '../../../i18n/useTranslation';
import { mediaApiAction } from '../mediaApiSlice';

// ── Animated Equalizer (3 bars) ─────────────────────────────────────────────
const equalizerKeyframes = `
  @keyframes eq-bar {
    0%, 100% { height: 30%; }
    50%       { height: 100%; }
  }
`;
const EqualizerBars = () => (
  <>
    <style>{equalizerKeyframes}</style>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 18, px: 0.5 }}>
      {[0, 0.15, 0.3].map((delay, i) => (
        <Box
          key={i}
          sx={{
            width: 4, bgcolor: '#7C3AED', borderRadius: 1,
            animation: `eq-bar 0.75s ${delay}s ease-in-out infinite`,
            height: '60%',
          }}
        />
      ))}
    </Box>
  </>
);

// ── Deterministic gradient from track id ────────────────────────────────────
const GRADIENTS = [
  'linear-gradient(135deg, #6D28D9, #EC4899)',
  'linear-gradient(135deg, #0EA5E9, #14B8A6)',
  'linear-gradient(135deg, #F97316, #EAB308)',
  'linear-gradient(135deg, #10B981, #3B82F6)',
  'linear-gradient(135deg, #8B5CF6, #F43F5E)',
];
const getGradient = (id) => {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < String(id).length; i++) hash = String(id).charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

// ── Format duration ──────────────────────────────────────────────────────────
const formatDuration = (sec) => {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
};

// ── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [dv, setDv] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon = LibraryMusicIcon, text }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5, gap: 1.5, opacity: 0.55 }}>
    <Icon sx={{ fontSize: 44, color: 'rgba(255,255,255,0.6)' }} />
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>{text}</Typography>
  </Box>
);

// ── Single Track Row ─────────────────────────────────────────────────────────
const TrackItem = ({ track, isPlaying, onPlayPause, onSelect, isSelected, isLoading }) => {
  const trackId = track._id || track.externalId;
  return (
    <ListItem
      onClick={() => onSelect(track)}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        mb: 0.5,
        border: isSelected ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
        bgcolor: isSelected ? 'rgba(124,58,237,0.12)' : 'transparent',
        transition: 'background-color 0.2s, border-color 0.2s',
        '&:hover': { bgcolor: isSelected ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.05)' },
        pr: '110px',  // room for secondary action
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {formatDuration(track.duration) && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mr: 0.5 }}>
              {formatDuration(track.duration)}
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onPlayPause(track); }}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          >
            {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: '#7C3AED', ml: 0.5 }} />
          ) : isSelected ? (
            <CheckCircleIcon sx={{ color: '#7C3AED', fontSize: 22, ml: 0.5 }} />
          ) : null}
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar sx={{ background: getGradient(trackId), width: 42, height: 42 }}>
          {isPlaying ? <EqualizerBars /> : <MusicNoteIcon sx={{ fontSize: 20 }} />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'white', maxWidth: 140 }}>
            {track.title}
          </Typography>
        }
        secondary={
          <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 140, display: 'block' }}>
            {track.artist}
          </Typography>
        }
      />
    </ListItem>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
// Bug 2a: No Drawer/Portal. Renders as a positioned Box inside the Dialog.
const MusicSelectorSheet = ({ open, onClose, onSelect, selectedTrackId }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [importingId, setImportingId] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Bug 2d: pause audio when sheet closes or unmounts
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingTrack(null);
    }
  }, [open]);
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const { data: myTracks = [], isLoading: myTracksLoading } = mediaApiAction.useGetMusicTracksQuery(undefined, { skip: !open });
  const { data: discoverResults = [], isLoading: discoverLoading } = mediaApiAction.useSearchFreeMusicQuery(
    debouncedSearch,
    { skip: !open || tab !== 1 }
  );
  const [importFreeTrack] = mediaApiAction.useImportFreeTrackMutation();
  const [uploadUserAudio] = mediaApiAction.useUploadUserAudioMutation();

  const handlePlayPause = (track) => {
    const isSame = (playingTrack?._id && playingTrack._id === track._id) ||
                   (playingTrack?.externalId && playingTrack.externalId === track.externalId);
    if (isSame) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingTrack(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const url = track.previewUrl || track.url;
      if (url) {
        audioRef.current = new Audio(url);
        audioRef.current.play().catch(() => {});
        audioRef.current.onended = () => setPlayingTrack(null);
        setPlayingTrack(track);
      }
    }
  };

  const handleSelectMyTrack = (track) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingTrack(null);
    onSelect(track);
  };

  const handleSelectDiscoverTrack = async (track) => {
    setImportingId(track.externalId);
    try {
      const imported = await importFreeTrack({
        previewUrl: track.previewUrl,
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        duration: track.duration,
      }).unwrap();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingTrack(null);
      onSelect(imported);
    } catch {
      // fallback: use as-is (no publicId)
      onSelect({ ...track, publicId: null });
    } finally {
      setImportingId(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      const track = await uploadUserAudio(formData).unwrap();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingTrack(null);
      onSelect(track);
    } catch {
      // ignore
    } finally {
      setUploadingAudio(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    // Bug 2a: absolute positioned Box inside Dialog — no nested Modal/Drawer
    <Box sx={{
      position: 'absolute', inset: 0,
      zIndex: 6,
      pointerEvents: open ? 'auto' : 'none',
    }}>
      {/* Scrim — click to close */}
      <Box
        onClick={onClose}
        sx={{
          position: 'absolute', inset: 0,
          bgcolor: 'rgba(0,0,0,0.6)',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.28s',
        }}
      />

      {/* Slide-up Panel */}
      <Box sx={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '76%',
        bgcolor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* Drag handle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0 }}>
          <Box sx={{ width: 38, height: 4, bgcolor: 'rgba(255,255,255,0.18)', borderRadius: 2 }} />
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1, pb: 0.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
            {t('selectMusic')}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs — fullWidth, Bug 3 polish */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            px: 1,
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 600, fontSize: '0.83rem',
              color: 'rgba(255,255,255,0.5)', minHeight: 40,
            },
            '& .Mui-selected': { color: 'white' },
            '& .MuiTabs-indicator': { backgroundColor: '#7C3AED', height: 3, borderRadius: 3 }
          }}
        >
          <Tab label={t('myLibrary')} />
          <Tab label={t('discover')} />
          <Tab label={t('uploadFromDevice')} />
        </Tabs>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pt: 1, '::-webkit-scrollbar': { display: 'none' } }}>

          {/* ── Tab 0: My Library ── */}
          {tab === 0 && (
            myTracksLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress size={28} sx={{ color: '#7C3AED' }} />
              </Box>
            ) : myTracks.length === 0 ? (
              <EmptyState icon={LibraryMusicIcon} text={t('noMusicFound')} />
            ) : (
              <List disablePadding>
                {myTracks.map(track => (
                  <TrackItem
                    key={track._id}
                    track={track}
                    isPlaying={playingTrack?._id === track._id}
                    onPlayPause={handlePlayPause}
                    onSelect={handleSelectMyTrack}
                    isSelected={selectedTrackId === track._id}
                  />
                ))}
              </List>
            )
          )}

          {/* ── Tab 1: Discover ── */}
          {tab === 1 && (
            <Box>
              <TextField
                fullWidth
                size="small"
                autoFocus
                placeholder={t('searchMusic')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
                  },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.35)' },
                }}
              />
              {discoverLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                  <CircularProgress size={28} sx={{ color: '#7C3AED' }} />
                </Box>
              ) : discoverResults.length === 0 ? (
                <EmptyState icon={SearchIcon} text={searchQuery ? t('noMusicFound') : t('searchMusic')} />
              ) : (
                <List disablePadding>
                  {discoverResults.map(track => (
                    <TrackItem
                      key={track.externalId}
                      track={track}
                      isPlaying={playingTrack?.externalId === track.externalId}
                      onPlayPause={handlePlayPause}
                      onSelect={handleSelectDiscoverTrack}
                      isLoading={importingId === track.externalId}
                      isSelected={selectedTrackId === track.externalId}
                    />
                  ))}
                </List>
              )}
              {importingId && (
                <Typography variant="caption" sx={{ color: '#7C3AED', display: 'block', textAlign: 'center', mt: 1 }}>
                  {t('addingToLibrary')}
                </Typography>
              )}
            </Box>
          )}

          {/* ── Tab 2: Upload from Device ── */}
          {tab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2, px: 1 }}>
              <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              <Box
                onClick={() => !uploadingAudio && fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed rgba(124,58,237,0.4)',
                  borderRadius: 4,
                  p: 4,
                  width: '100%',
                  minHeight: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  cursor: uploadingAudio ? 'default' : 'pointer',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  '&:hover': uploadingAudio ? {} : {
                    borderColor: '#7C3AED',
                    bgcolor: 'rgba(124,58,237,0.06)',
                  },
                }}
              >
                {uploadingAudio ? (
                  <>
                    <CircularProgress size={36} sx={{ color: '#7C3AED' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>{t('processing')}</Typography>
                  </>
                ) : (
                  <>
                    <UploadFileIcon sx={{ fontSize: 52, color: '#7C3AED' }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white' }}>{t('uploadFromDevice')}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
                      MP3, M4A, WAV supported
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default MusicSelectorSheet;
