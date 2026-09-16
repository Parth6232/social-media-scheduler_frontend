import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Dialog, Box, IconButton, Typography, Slider, Chip, ThemeProvider, createTheme,
  Tabs, Tab, Stack, useMediaQuery, useTheme, Switch, FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FlipIcon from '@mui/icons-material/Flip';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from '../../../i18n/useTranslation';
import MusicSelectorSheet from './MusicSelectorSheet';
import { mediaApiAction } from '../mediaApiSlice';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { paper: '#000', default: '#000' },
    primary: { main: '#fff' },
  },
  typography: { fontFamily: 'Inter, sans-serif' },
});

const CSS_FILTERS = {
  none: 'none', grayscale: 'grayscale(1)', sepia: 'sepia(1)',
  vintage: 'sepia(0.8) brightness(0.9)', vivid: 'saturate(1.5) contrast(1.1)',
  cold: 'hue-rotate(180deg) brightness(1.1) saturate(0.8)',
  warm: 'hue-rotate(330deg) brightness(1.1) saturate(1.2)', blur_bg: 'blur(2px)',
  clarendon: 'contrast(1.3) saturate(1.2)', juno: 'saturate(1.4) brightness(1.1)',
  gingham: 'brightness(1.1) contrast(0.9) saturate(0.8)', moon: 'grayscale(1) brightness(1.1)',
  lark: 'saturate(1.15) brightness(1.05)', crema: 'sepia(0.3) saturate(0.9)',
  fade: 'saturate(0.7) brightness(1.1)', dramatic: 'contrast(1.4) saturate(0.9)',
  noir: 'grayscale(1) contrast(1.4)', cinematic: 'contrast(1.2) saturate(0.9) hue-rotate(10deg)',
  golden_hour: 'sepia(0.2) brightness(1.1) saturate(1.1) hue-rotate(-10deg)',
  cool_tone: 'hue-rotate(200deg) saturate(0.9)', sharpen: 'contrast(1.2) brightness(1.05)',
  oil_paint: 'saturate(1.3) contrast(1.1) blur(1px)', cartoon: 'saturate(1.5) contrast(1.3)',
  pixelate: 'blur(4px)', art_audrey: 'grayscale(1) contrast(1.2)',
  art_eucalyptus: 'sepia(0.2) hue-rotate(90deg)', art_peacock: 'hue-rotate(200deg) saturate(1.5)',
  art_zorro: 'grayscale(1) contrast(1.5)', art_incognito: 'contrast(1.2) brightness(0.8)',
  art_frost: 'hue-rotate(180deg) brightness(1.2)', art_primavera: 'saturate(1.4) hue-rotate(45deg)'
};

const FILTER_CATEGORIES = {
  Basic: ['none', 'grayscale', 'sepia', 'vintage', 'vivid', 'cold', 'warm', 'blur_bg'],
  Mood: ['clarendon', 'juno', 'gingham', 'moon', 'lark', 'crema', 'fade'],
  Dramatic: ['dramatic', 'noir', 'cinematic', 'golden_hour', 'cool_tone'],
  Artistic: ['sharpen', 'oil_paint', 'cartoon', 'pixelate', 'art_audrey', 'art_eucalyptus', 'art_peacock', 'art_zorro', 'art_incognito', 'art_frost', 'art_primavera']
};

const ASPECT_RATIOS = [
  { label: 'Original', value: null },
  { label: '9:16', value: '9:16', width: '56.25%', height: '100%' },
  { label: '1:1', value: '1:1', width: '100%', height: '100%' },
  { label: '16:9', value: '16:9', width: '100%', height: '56.25%' },
  { label: '4:5', value: '4:5', width: '80%', height: '100%' }
];

const formatDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
};

const generateFakeBars = (seed, count = 60) => {
  let hash = 0;
  for (let i = 0; i < String(seed).length; i++) {
    hash = String(seed).charCodeAt(i) + ((hash << 5) - hash);
  }
  const rand = (min, max, idx) => {
    const n = Math.sin(hash + idx) * 10000;
    return min + (n - Math.floor(n)) * (max - min);
  };
  return Array.from({ length: count }, (_, i) => rand(20, 100, i));
};

const MediaEditorModal = ({ open, media, onClose, onApply }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const musicPreviewRef = useRef(null);
  const scrubberRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: serverFilters = [] } = mediaApiAction.useGetFiltersQuery(undefined, { skip: !open });

  const [isPlaying, setIsPlaying] = useState(false);
  const [trimRange, setTrimRange] = useState([0, media?.duration || 15]);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [filterCategory, setFilterCategory] = useState('Basic');
  
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [musicSheetOpen, setMusicSheetOpen] = useState(false);
  // Naya States
  const [musicStartOffset, setMusicStartOffset] = useState(0);
  const [musicVolume, setMusicVolume] = useState(100);
  const [replaceOriginalAudio, setReplaceOriginalAudio] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [rotate, setRotate] = useState(0);
  const [flip, setFlip] = useState(null);
  const [showWatermarkBanner, setShowWatermarkBanner] = useState(true);

  const isVideo = media?.resourceType === 'video';
  const clipDuration = trimRange[1] - trimRange[0];
  const songDuration = selectedMusic?.duration || 0;
  const maxMusicOffset = Math.max(0, songDuration - clipDuration);
  const selectedMusicId = selectedMusic?._id || selectedMusic?.externalId || null;

  const fakeBars = useMemo(() => {
    if (!selectedMusicId) return [];
    return generateFakeBars(selectedMusicId);
  }, [selectedMusicId]);

  useEffect(() => {
    if (media && media.duration) {
      setTrimRange([0, media.duration]);
      setCurrentTime(0);
    }
  }, [media]);

  useEffect(() => {
    if (videoRef.current) {
      // If replaceOriginalAudio is true, mute the video player preview
      videoRef.current.volume = (isMuted || (replaceOriginalAudio && selectedMusic)) ? 0 : Math.min(volume / 100, 1);
      let rate = 1.0;
      if (speed > 0) rate = 1 + (speed / 100);
      if (speed < 0) rate = 1 + (speed / 100);
      videoRef.current.playbackRate = Math.max(0.1, rate);
    }
  }, [volume, isMuted, speed, isPlaying, replaceOriginalAudio, selectedMusic]);

  // Audio cleanup and sync
  useEffect(() => {
    if (!open || activeTab !== 3) {
      if (musicPreviewRef.current) musicPreviewRef.current.pause();
    }
  }, [open, activeTab]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.currentTime >= trimRange[1] || videoRef.current.currentTime < trimRange[0]) {
          videoRef.current.currentTime = trimRange[0];
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (time >= trimRange[1]) {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = trimRange[0];
      }
    }
  };

  const handleApply = () => {
    onApply({
      publicId: media.publicId,
      resourceType: media.resourceType,
      trimStart: trimRange[0],
      trimEnd: trimRange[1],
      filter: selectedFilter !== 'none' ? selectedFilter : null,
      musicPublicId: selectedMusic ? selectedMusic.publicId : null,
      speed: speed !== 0 ? speed : undefined,
      volume: isMuted ? 0 : (volume !== 100 ? volume : undefined),
      aspectRatio: aspectRatio || undefined,
      rotate: rotate !== 0 ? rotate : undefined,
      flip: flip || undefined,
      musicStartOffset: selectedMusic ? musicStartOffset : undefined,
      musicVolume: selectedMusic && musicVolume !== 100 ? musicVolume : undefined,
      replaceOriginalAudio: selectedMusic ? replaceOriginalAudio : undefined,
    });
  };

  // Music Scrubber Logic
  const handleScrubberPointerDown = (e) => {
    if (!selectedMusic || songDuration <= clipDuration) return;
    setIsScrubbing(true);
    e.target.setPointerCapture(e.pointerId);
    updateScrubber(e);
  };

  const handleScrubberPointerMove = (e) => {
    if (!isScrubbing || !selectedMusic || songDuration <= clipDuration) return;
    updateScrubber(e);
  };

  const handleScrubberPointerUp = (e) => {
    if (!isScrubbing) return;
    setIsScrubbing(false);
    e.target.releasePointerCapture(e.pointerId);
    if (musicPreviewRef.current) {
      musicPreviewRef.current.pause();
    }
  };

  const updateScrubber = (e) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    let newOffset = percentage * songDuration;
    
    // The window represents clipDuration. Adjust so it doesn't overflow the end
    // Typically the user drags the center of the window or we just map x to the start
    // If we map x to the start, we just cap it.
    // Actually it's better to map the x position to the center of the window
    const windowWidthPercent = clipDuration / songDuration;
    const windowWidthPx = windowWidthPercent * rect.width;
    // Map click to center of window
    let windowStartPx = x - (windowWidthPx / 2);
    windowStartPx = Math.max(0, Math.min(windowStartPx, rect.width - windowWidthPx));
    
    newOffset = (windowStartPx / rect.width) * songDuration;
    newOffset = Math.max(0, Math.min(newOffset, maxMusicOffset));
    
    setMusicStartOffset(newOffset);

    // Play preview
    if (musicPreviewRef.current && (musicPreviewRef.current.paused || musicPreviewRef.current.currentTime < newOffset || musicPreviewRef.current.currentTime > newOffset + 2)) {
      musicPreviewRef.current.currentTime = newOffset;
      musicPreviewRef.current.play().catch(() => {});
    }
  };

  if (!media) return null;
  const transformStyle = `rotate(${rotate}deg) scaleX(${flip === 'horizontal' ? -1 : 1}) scaleY(${flip === 'vertical' ? -1 : 1})`;

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        fullScreen={isMobile}
        open={open}
        onClose={onClose}
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: '#000',
            backgroundImage: 'none',
            width: isMobile ? '100%' : 420,
            height: isMobile ? '100%' : 820,
            maxHeight: '100%',
            borderRadius: isMobile ? 0 : 4,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          p: 2, zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0,
          background: 'linear-gradient(rgba(0,0,0,0.85), transparent)', gap: 1,
        }}>
          <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            {isVideo && (
              <Chip
                icon={<MusicNoteIcon sx={{ fontSize: 18 }} />}
                label={selectedMusic ? selectedMusic.title : t('addMusic')}
                onClick={() => setMusicSheetOpen(true)}
                onDelete={selectedMusic ? () => { setSelectedMusic(null); if (activeTab === 3) setActiveTab(0); } : undefined}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)', color: 'white',
                  maxWidth: isMobile ? 130 : 220,
                  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                  '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            )}
            <IconButton onClick={handleApply} sx={{ color: 'black', bgcolor: 'white', flexShrink: 0, '&:hover': { bgcolor: '#ddd' } }}>
              <CheckIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{
          flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
          position: 'relative', overflow: 'hidden', pt: 8, pb: '200px',
        }}>
          <Box
            sx={{ position: 'relative', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={isVideo ? togglePlay : undefined}
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={media.url}
                onTimeUpdate={handleTimeUpdate}
                style={{
                  maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                  filter: CSS_FILTERS[selectedFilter] || 'none',
                  transform: transformStyle, transition: 'transform 0.3s'
                }}
                playsInline
              />
            ) : (
              <img
                src={media.url}
                alt="Preview"
                style={{
                  maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                  filter: CSS_FILTERS[selectedFilter] || 'none',
                  transform: transformStyle, transition: 'transform 0.3s'
                }}
              />
            )}

            {aspectRatio && (
              <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                border: '2px solid rgba(255,255,255,0.6)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                pointerEvents: 'none',
                width: ASPECT_RATIOS.find(r => r.value === aspectRatio)?.width || '100%',
                height: ASPECT_RATIOS.find(r => r.value === aspectRatio)?.height || '100%',
                maxHeight: '100%', maxWidth: '100%'
              }} />
            )}

            {isVideo && !isPlaying && (
              <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%', p: 1.5, pointerEvents: 'none'
              }}>
                <PlayArrowIcon sx={{ fontSize: 44, color: 'white' }} />
              </Box>
            )}

            {showWatermarkBanner && (
              <Box sx={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'center' }}>
                <Chip
                  icon={<InfoIcon sx={{ fontSize: 15 }} />} label={t('watermarkInfo')}
                  onDelete={() => setShowWatermarkBanner(false)} size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.65)', color: 'white', backdropFilter: 'blur(6px)', '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.6)' } }}
                />
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.92) 22%, #000)',
          pt: 3, pb: 2, zIndex: 5,
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            centered
            sx={{
              minHeight: 36, mb: 1,
              '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', px: 1 },
              '& .Mui-selected': { color: 'white', fontWeight: 700 },
              '& .MuiTabs-indicator': { backgroundColor: '#7C3AED', height: 3, borderRadius: 3 }
            }}
          >
            <Tab label={t('filters')} />
            <Tab label="Adjust" />
            {isVideo && media.duration && <Tab label={t('trim')} />}
            {isVideo && selectedMusic && <Tab label={t('musicTab')} />}
          </Tabs>

          <Box sx={{ height: 148, px: 2, overflow: 'hidden' }}>

            {/* ── Filters Tab ── */}
            {activeTab === 0 && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mb: 1.5, '::-webkit-scrollbar': { display: 'none' } }}>
                  {Object.keys(FILTER_CATEGORIES).map(cat => (
                    <Chip
                      key={cat} label={t(cat.toLowerCase()) || cat} onClick={() => setFilterCategory(cat)} size="small"
                      sx={{
                        bgcolor: filterCategory === cat ? 'white' : 'rgba(255,255,255,0.1)',
                        color: filterCategory === cat ? 'black' : 'white',
                        fontWeight: 600, flexShrink: 0,
                        '&:hover': { bgcolor: filterCategory === cat ? 'white' : 'rgba(255,255,255,0.2)' }
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1, '::-webkit-scrollbar': { display: 'none' } }}>
                  {FILTER_CATEGORIES[filterCategory].map((filterName) => {
                    if (filterName !== 'none' && !serverFilters.includes(filterName)) return null;
                    const isSelected = selectedFilter === filterName;
                    return (
                      <Box
                        key={filterName} onClick={() => setSelectedFilter(filterName)}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <Box sx={{
                          width: 58, height: 58, borderRadius: '50%',
                          border: isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.15)',
                          overflow: 'hidden', mb: 0.5, boxShadow: isSelected ? '0 0 0 2px #7C3AED' : 'none',
                          transition: 'border 0.15s, box-shadow 0.15s'
                        }}>
                          {isVideo ? (
                            <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: CSS_FILTERS[filterName] || 'none' }} />
                          ) : (
                            <img src={media.url} alt={filterName} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: CSS_FILTERS[filterName] || 'none' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '0.68rem', textAlign: 'center' }}>
                          {filterName === 'none' ? 'Normal' : filterName.replace('art_', '')}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ── Adjust Tab ── */}
            {activeTab === 1 && (
              <Box sx={{ height: '100%', overflowY: 'auto', '::-webkit-scrollbar': { display: 'none' } }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block' }}>{t('aspectRatio')}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {ASPECT_RATIOS.map(r => (
                        <Chip
                          key={r.label} label={r.label} size="small"
                          onClick={() => setAspectRatio(r.value)}
                          sx={{
                            bgcolor: aspectRatio === r.value ? '#7C3AED' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600,
                            '&:hover': { bgcolor: aspectRatio === r.value ? '#6D28D9' : 'rgba(255,255,255,0.2)' }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 0.5, display: 'block' }}>{t('rotate')}</Typography>
                      <IconButton onClick={() => setRotate(r => (r + 90) % 360)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        <RotateRightIcon />
                      </IconButton>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 0.5, display: 'block' }}>{t('flip')}</Typography>
                      <IconButton
                        onClick={() => setFlip(f => f === 'horizontal' ? 'vertical' : (f === 'vertical' ? null : 'horizontal'))}
                        sx={{ bgcolor: flip ? '#7C3AED' : 'rgba(255,255,255,0.1)', color: 'white' }}
                      >
                        <FlipIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {isVideo && (
                    <>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'space-between' }}>
                          {t('speed')} <span style={{ color: 'white', fontWeight: 700 }}>{speed === 0 ? '1x' : `${(1 + speed / 100).toFixed(1)}x`}</span>
                        </Typography>
                        <Slider value={speed} onChange={(e, v) => setSpeed(v)} min={-50} max={100} step={10} sx={{ color: '#7C3AED' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'space-between' }}>
                          {t('videoVolume') || t('volume')} <span style={{ color: 'white', fontWeight: 700 }}>{isMuted ? 'Muted' : `${volume}%`}</span>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <IconButton onClick={() => setIsMuted(m => !m)} size="small" sx={{ color: 'white', p: 0.5 }} disabled={replaceOriginalAudio && selectedMusic}>
                            {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
                          </IconButton>
                          <Slider
                            value={isMuted ? 0 : volume}
                            onChange={(e, v) => { setVolume(v); setIsMuted(false); }}
                            min={0} max={200}
                            sx={{ color: '#7C3AED' }}
                            disabled={replaceOriginalAudio && !!selectedMusic}
                          />
                        </Box>
                      </Box>
                    </>
                  )}
                </Stack>
              </Box>
            )}

            {/* ── Trim Tab ── */}
            {activeTab === 2 && isVideo && media.duration && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{currentTime.toFixed(1)}s</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{trimRange[1].toFixed(1)}s</Typography>
                </Box>
                <Slider
                  value={trimRange}
                  onChange={(e, newValue) => {
                    setTrimRange(newValue);
                    if (videoRef.current) {
                      videoRef.current.currentTime = newValue[0];
                      setCurrentTime(newValue[0]);
                    }
                  }}
                  valueLabelDisplay="auto"
                  max={media.duration}
                  step={0.1}
                  sx={{
                    color: '#fff',
                    '& .MuiSlider-thumb': { width: 22, height: 22, bgcolor: '#fff' },
                    '& .MuiSlider-track': { border: 'none', bgcolor: '#fff' },
                    '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.25)' },
                  }}
                />
              </Box>
            )}

            {/* ── Music Tab ── */}
            {activeTab === 3 && isVideo && selectedMusic && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, px: 1, overflowY: 'auto', '::-webkit-scrollbar': { display: 'none' } }}>
                {songDuration <= clipDuration ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>{t('fullTrackUsed')}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block', textAlign: 'center' }}>
                      {t('dragToSelectPart')}
                    </Typography>
                    {/* Scrubber Container */}
                    <Box
                      ref={scrubberRef}
                      onPointerDown={handleScrubberPointerDown}
                      onPointerMove={handleScrubberPointerMove}
                      onPointerUp={handleScrubberPointerUp}
                      onPointerCancel={handleScrubberPointerUp}
                      onPointerLeave={handleScrubberPointerUp}
                      sx={{
                        position: 'relative', height: 48, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', touchAction: 'none', cursor: 'grab',
                        '&:active': { cursor: 'grabbing' }
                      }}
                    >
                      {/* Fake Waveform */}
                      {fakeBars.map((h, i) => {
                        const barTime = (i / fakeBars.length) * songDuration;
                        const isInside = barTime >= musicStartOffset && barTime <= (musicStartOffset + clipDuration);
                        return (
                          <Box key={i} sx={{
                            width: '1%', height: `${h}%`, bgcolor: isInside ? '#7C3AED' : 'rgba(255,255,255,0.2)',
                            borderRadius: 1, transition: 'background-color 0.1s'
                          }} />
                        );
                      })}
                      
                      {/* Window Overlay */}
                      <Box sx={{
                        position: 'absolute', top: 0, bottom: 0,
                        left: `${(musicStartOffset / songDuration) * 100}%`,
                        width: `${(clipDuration / songDuration) * 100}%`,
                        border: '2px solid white', borderRadius: 2, pointerEvents: 'none',
                        boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)'
                      }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{formatDuration(musicStartOffset)}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{formatDuration(musicStartOffset + clipDuration)}</Typography>
                    </Box>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'space-between' }}>
                    {t('musicVolume')} <span style={{ color: 'white', fontWeight: 700 }}>{musicVolume}%</span>
                  </Typography>
                  <Slider
                    value={musicVolume}
                    onChange={(e, v) => setMusicVolume(v)}
                    min={0} max={200}
                    sx={{ color: '#7C3AED' }}
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={replaceOriginalAudio}
                      onChange={(e) => setReplaceOriginalAudio(e.target.checked)}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#7C3AED' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7C3AED' },
                      }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: 'white' }}>{t('replaceOriginalAudio')}</Typography>}
                />
              </Box>
            )}

          </Box>
        </Box>

        <MusicSelectorSheet
          open={musicSheetOpen}
          onClose={() => setMusicSheetOpen(false)}
          onSelect={(track) => {
            setSelectedMusic(track);
            setMusicSheetOpen(false);
            if (track) {
              setMusicStartOffset(0);
              const tabIndex = media?.duration ? 3 : 2; // Usually 3 if isVideo && media.duration
              setActiveTab(3);
            }
          }}
          selectedTrackId={selectedMusicId}
        />
        
        {/* Hidden Audio for Scrubber Preview */}
        {selectedMusic && (
          <audio ref={musicPreviewRef} src={selectedMusic.previewUrl || selectedMusic.url} preload="auto" />
        )}
      </Dialog>
    </ThemeProvider>
  );
};

export default MediaEditorModal;
