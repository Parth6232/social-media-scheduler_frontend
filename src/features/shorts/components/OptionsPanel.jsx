// NAYA: OptionsPanel — sare switches, sliders aur upload controls
import { useState, useCallback } from 'react';
import {
  Box, Typography, Switch, FormControlLabel, Slider, IconButton, Chip,
  Collapse, Button as MuiButton, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TuneIcon from '@mui/icons-material/Tune';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../../../i18n/useTranslation';
import Button from '../../../common/Button';
import GlassCard from '../../../common/components/motion/GlassCard';
import MusicSelectorSheet from '../../media/components/MusicSelectorSheet';
import { showToast } from '../../../store/redux/slices/toastSlice';

const MAX_VOICEOVER_MB = 20;

const OptionsPanel = ({ options, onChange, onGenerate, isGenerating, isDisabled, authorized }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [musicSheetOpen, setMusicSheetOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const {
    facecamCrop, captions, originalAudio,
    musicTrack, musicVolume,
    voiceoverFile, voiceoverVolume,
    minSec, maxSec,
  } = options;

  const set = (key, val) => onChange({ ...options, [key]: val });

  // NAYA: voiceover file drop handle — audio only, max 20MB
  const onDropVoiceover = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      dispatch(showToast({ message: `Voiceover must be an audio file under ${MAX_VOICEOVER_MB}MB.`, variant: 'warning' }));
      return;
    }
    const f = accepted[0];
    if (!f) return;
    if (f.size > MAX_VOICEOVER_MB * 1024 * 1024) {
      dispatch(showToast({ message: `Voiceover file too large (max ${MAX_VOICEOVER_MB}MB).`, variant: 'warning' }));
      return;
    }
    onChange({ ...options, voiceoverFile: f });
  }, [dispatch, onChange, options]);

  const { getRootProps: getVoiceRootProps, getInputProps: getVoiceInputProps, isDragActive: isVoiceDrag } = useDropzone({
    onDrop: onDropVoiceover,
    accept: { 'audio/*': [] },
    maxFiles: 1,
    maxSize: MAX_VOICEOVER_MB * 1024 * 1024,
    disabled: isDisabled,
  });

  // NAYA: music track select karo
  const handleMusicSelect = (track) => {
    setMusicSheetOpen(false);
    onChange({
      ...options,
      musicTrack: track,
      // default volume: 25 if original voice on, else 70
      musicVolume: originalAudio ? 25 : 70,
    });
  };

  const handleOriginalAudioToggle = (val) => {
    onChange({
      ...options,
      originalAudio: val,
      musicVolume: val ? 25 : (musicTrack ? 70 : musicVolume),
    });
  };

  // NAYA: generate button click — FormData build karke parent ko dena
  const handleGenerate = () => {
    if (minSec >= maxSec) {
      dispatch(showToast({ message: 'Min clip length must be less than max.', variant: 'warning' }));
      return;
    }
    onGenerate();
  };

  const isGenerateDisabled = isDisabled || isGenerating || authorized === false;

  return (
    <GlassCard sx={{ mb: 3, borderRadius: 3, position: 'relative', overflow: 'visible' }}>
      {/* MusicSelectorSheet — absolute positioned inside this card */}
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <TuneIcon sx={{ color: '#2563EB', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600}>Options</Typography>
          </Box>

          {/* Switches */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
            {/* Facecam crop */}
            <FormControlLabel
              control={
                <Switch
                  checked={facecamCrop}
                  onChange={(e) => set('facecamCrop', e.target.checked)}
                  disabled={isDisabled}
                  size="small"
                  aria-label={t('shorts_facecam')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>{t('shorts_facecam')}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}>
                    Detects a face and focuses the 9:16 crop on it
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0, py: 0.75 }}
            />

            {/* Captions */}
            <FormControlLabel
              control={
                <Switch
                  checked={captions}
                  onChange={(e) => set('captions', e.target.checked)}
                  disabled={isDisabled}
                  size="small"
                  aria-label={t('shorts_captions')}
                />
              }
              label={<Typography variant="body2" fontWeight={500}>{t('shorts_captions')}</Typography>}
              sx={{ m: 0, py: 0.75 }}
            />

            {/* Original voice */}
            <FormControlLabel
              control={
                <Switch
                  checked={originalAudio}
                  onChange={(e) => handleOriginalAudioToggle(e.target.checked)}
                  disabled={isDisabled}
                  size="small"
                  aria-label={t('shorts_originalVoice')}
                />
              }
              label={<Typography variant="body2" fontWeight={500}>{t('shorts_originalVoice')}</Typography>}
              sx={{ m: 0, py: 0.75 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Background music */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t('shorts_music')}</Typography>
            {musicTrack ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<MusicNoteIcon sx={{ fontSize: 14 }} />}
                  label={musicTrack.title}
                  size="small"
                  sx={{ maxWidth: 200 }}
                  onDelete={isDisabled ? undefined : () => set('musicTrack', null)}
                />
              </Box>
            ) : (
              <MuiButton
                variant="outlined"
                size="small"
                startIcon={<MusicNoteIcon />}
                onClick={() => setMusicSheetOpen(true)}
                disabled={isDisabled}
                sx={{
                  borderRadius: 2, textTransform: 'none', borderColor: 'divider',
                  '&:hover': { borderColor: '#2563EB', color: '#2563EB' },
                }}
              >
                {t('shorts_music')}
              </MuiButton>
            )}

            {/* Music volume slider */}
            {musicTrack && (
              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">{t('shorts_musicVolume')}</Typography>
                  <Typography variant="caption" fontWeight={600}>{musicVolume}</Typography>
                </Box>
                <Slider
                  value={musicVolume}
                  min={0} max={100}
                  onChange={(_, v) => set('musicVolume', v)}
                  disabled={isDisabled || !musicTrack}
                  size="small"
                  aria-label={t('shorts_musicVolume')}
                  sx={{ color: '#2563EB' }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Custom voiceover */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t('shorts_voiceover')}</Typography>
            {voiceoverFile ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="caption" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {voiceoverFile.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => set('voiceoverFile', null)}
                    disabled={isDisabled}
                    aria-label="Remove voiceover"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                {/* Audio preview */}
                <Box
                  component="audio"
                  controls
                  src={URL.createObjectURL(voiceoverFile)}
                  sx={{ width: '100%', height: 36, mb: 1 }}
                />
                {/* Voiceover volume slider */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">{t('shorts_voiceoverVolume')}</Typography>
                  <Typography variant="caption" fontWeight={600}>{voiceoverVolume}%</Typography>
                </Box>
                <Slider
                  value={voiceoverVolume}
                  min={0} max={200}
                  onChange={(_, v) => set('voiceoverVolume', v)}
                  disabled={isDisabled}
                  size="small"
                  aria-label={t('shorts_voiceoverVolume')}
                  sx={{ color: '#2563EB' }}
                />
              </Box>
            ) : (
              <Box
                {...getVoiceRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isVoiceDrag ? '#2563EB' : 'divider',
                  borderRadius: 2,
                  p: 2.5,
                  textAlign: 'center',
                  cursor: isDisabled ? 'default' : 'pointer',
                  bgcolor: isVoiceDrag ? 'rgba(37,99,235,0.05)' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': isDisabled ? {} : { borderColor: '#2563EB', bgcolor: 'rgba(37,99,235,0.04)' },
                }}
              >
                <input {...getVoiceInputProps()} />
                <UploadFileIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Drop audio file here or click (max {MAX_VOICEOVER_MB}MB)
                </Typography>
              </Box>
            )}
          </Box>

          {/* Advanced collapsible */}
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', py: 0.5 }}
              onClick={() => setAdvancedOpen((p) => !p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setAdvancedOpen((p) => !p)}
            >
              <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', flex: 1 }}>
                Advanced
              </Typography>
              {advancedOpen ? <ExpandLessIcon sx={{ fontSize: 18, color: 'text.disabled' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.disabled' }} />}
            </Box>
            <Collapse in={advancedOpen}>
              <Box sx={{ pt: 1.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t('shorts_clipLength')}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Min (sec)</Typography>
                    <Slider
                      value={minSec}
                      min={10} max={89}
                      onChange={(_, v) => set('minSec', Math.min(v, maxSec - 1))}
                      disabled={isDisabled}
                      size="small"
                      aria-label="Min clip seconds"
                      valueLabelDisplay="auto"
                      sx={{ color: '#2563EB' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>–</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Max (sec)</Typography>
                    <Slider
                      value={maxSec}
                      min={11} max={90}
                      onChange={(_, v) => set('maxSec', Math.max(v, minSec + 1))}
                      disabled={isDisabled}
                      size="small"
                      aria-label="Max clip seconds"
                      valueLabelDisplay="auto"
                      sx={{ color: '#2563EB' }}
                    />
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {minSec}s – {maxSec}s
                </Typography>
              </Box>
            </Collapse>
          </Box>

          {/* Generate button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={isGenerateDisabled}
            sx={{ mt: 3, borderRadius: 2, py: 1.25, fontWeight: 700 }}
          >
            {t('shorts_generate')}
          </Button>
          {authorized === false && (
            <Typography variant="caption" sx={{ color: 'warning.main', display: 'block', textAlign: 'center', mt: 1 }}>
              Generation is disabled — video not authorized for use.
            </Typography>
          )}
        </Box>

        {/* Music Selector Sheet — inside the card, absolute overlay */}
        <Box sx={{ position: 'absolute', inset: 0, borderRadius: 3, overflow: 'hidden', pointerEvents: musicSheetOpen ? 'auto' : 'none' }}>
          <MusicSelectorSheet
            open={musicSheetOpen}
            onClose={() => setMusicSheetOpen(false)}
            onSelect={handleMusicSelect}
            selectedTrackId={musicTrack?._id}
          />
        </Box>
      </Box>
    </GlassCard>
  );
};

export default OptionsPanel;
