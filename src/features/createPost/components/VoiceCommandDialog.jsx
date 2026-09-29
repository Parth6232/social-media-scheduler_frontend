// NEW: voice command dialog — Feature 4
import {
  Dialog, DialogContent, Box, Typography, IconButton, TextField, Chip,
  Tooltip, Alert, CircularProgress, Skeleton
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { showToast } from '../../../store/redux/slices/toastSlice';
import { aiApiAction } from '../../ai/aiApiSlice';
import { useTranslation } from '../../../i18n/useTranslation';
import { POST_RULES } from '../../../config/postRules';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';
import Button from '../../../common/Button';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ fontSize: 16 }} />,
  facebook: <FacebookIcon sx={{ fontSize: 16 }} />,
  instagram: <InstagramIcon sx={{ fontSize: 16 }} />,
};
const PLATFORM_COLORS = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E1306C',
};

// Animated waveform bars
const Waveform = ({ active, reduced }) => {
  const bars = [3, 8, 5, 12, 7, 10, 4, 9, 6, 11, 3, 8];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 24 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          style={{
            width: 3,
            backgroundColor: '#A78BFA',
            borderRadius: 2,
            height: active ? undefined : `${h * 0.5}px`,
          }}
          animate={
            active && !reduced
              ? {
                  height: [`${h * 0.5}px`, `${h * 2}px`, `${h * 0.5}px`],
                  opacity: [0.6, 1, 0.6],
                }
              : { height: `${h * 0.5}px` }
          }
          transition={
            active && !reduced
              ? { repeat: Infinity, duration: 0.8 + i * 0.07, ease: 'easeInOut' }
              : {}
          }
        />
      ))}
    </Box>
  );
};

// Pulsing mic orb
const MicOrb = ({ listening, reduced }) => (
  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
    {listening && !reduced && (
      <>
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            style={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid rgba(139,92,246,0.4)',
            }}
            animate={{ scale: [1, 1.5 + ring * 0.3], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: ring * 0.3, ease: 'easeOut' }}
          />
        ))}
      </>
    )}
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: listening
          ? 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)'
          : 'rgba(139,92,246,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid',
        borderColor: listening ? 'transparent' : 'rgba(139,92,246,0.3)',
        transition: 'all 0.3s ease',
        boxShadow: listening ? '0 0 30px rgba(139,92,246,0.5)' : 'none',
      }}
    >
      <MicIcon sx={{ fontSize: 36, color: listening ? '#fff' : '#A78BFA' }} />
    </Box>
  </Box>
);

// ── MAIN DIALOG ───────────────────────────────────────────────────────────────

const VoiceCommandDialog = ({
  open,
  onClose,
  onConfirm,
  connectedPlatforms,
  useSpeechRecognitionHook,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const reduced = usePrefersReducedMotion();
  const isDark = theme.palette.mode === 'dark';

  const [parseCommand, { isLoading: isParsing }] = aiApiAction.parseCommand();

  // Screen: 'listen' | 'parsing' | 'confirm'
  const [screen, setScreen] = useState('listen');
  const [lang, setLang] = useState('hi-IN');
  const [editableText, setEditableText] = useState('');
  const [parsed, setParsed] = useState(null);

  // Confirm screen local state
  const [confirmTopic, setConfirmTopic] = useState('');
  const [confirmPlatforms, setConfirmPlatforms] = useState([]);
  const [confirmScheduledAt, setConfirmScheduledAt] = useState(null);
  const [autoFillAI, setAutoFillAI] = useState(true);
  const [postNow, setPostNow] = useState(false);

  const { supported, listening, transcript, interim, start, stop, error } = useSpeechRecognitionHook;

  // Sync transcript into editable field
  useEffect(() => {
    if (transcript) setEditableText(transcript);
  }, [transcript]);

  // Auto-parse when speech ends
  const handleSpeechEnd = () => {
    if (transcript.trim()) handleParse(transcript.trim());
  };

  const handleStartListening = () => {
    setEditableText('');
    start(lang, handleSpeechEnd);
  };

  const handleParse = async (text) => {
    if (!text.trim()) {
      dispatch(showToast({ message: t('voice_emptyText'), variant: 'warning' }));
      return;
    }
    setScreen('parsing');
    try {
      const res = await parseCommand({ text }).unwrap();
      setParsed(res);
      setConfirmTopic(res.topic || '');
      const validPlatforms = (res.platforms || []).filter((p) => connectedPlatforms.includes(p));
      setConfirmPlatforms(validPlatforms);
      setConfirmScheduledAt(res.scheduledAt ? new Date(res.scheduledAt) : null);
      setPostNow(!res.scheduledAt);
      setScreen('confirm');
    } catch {
      setScreen('listen');
    }
  };

  const canConfirm = confirmTopic.trim().length > 0 && confirmPlatforms.length > 0;

  const handleConfirm = () => {
    onConfirm({
      topic: confirmTopic,
      platforms: confirmPlatforms,
      postType: parsed.postType,
      scheduledAt: postNow ? null : confirmScheduledAt,
      autoFillAI,
    });
    onClose();
    dispatch(showToast({ message: t('voice_formFilled'), variant: 'success' }));
  };

  const handleClose = () => {
    stop();
    setScreen('listen');
    setEditableText('');
    setParsed(null);
    setConfirmTopic('');
    setConfirmPlatforms([]);
    onClose();
  };

  const toggleConfirmPlatform = (p) => {
    const rule = parsed?.postType ? POST_RULES[parsed.postType] : null;
    const allowed = rule?.allowedPlatforms ?? Object.keys(PLATFORM_COLORS);
    if (!connectedPlatforms.includes(p) || !allowed.includes(p)) return;
    setConfirmPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const glassSx = {
    background: isDark ? 'rgba(10,14,30,0.90)' : 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(139,92,246,0.15)',
    borderRadius: 4,
    boxShadow: isDark
      ? '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1)'
      : '0 24px 60px rgba(139,92,246,0.15)',
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { ...glassSx, m: 2 } }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Close btn */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <IconButton size="small" onClick={handleClose} aria-label="Close voice dialog">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <AnimatePresence mode="wait">
          {/* ── LISTEN SCREEN ── */}
          {screen === 'listen' && (
            <motion.div
              key="listen"
              initial={reduced ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? {} : { opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Typography variant="h6" fontWeight={700} textAlign="center" sx={{ mb: 0.5 }}>
                {t('voice_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mb: 1 }}>
                {t('voice_hint')}
              </Typography>

              {/* Language toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                {['hi-IN', 'en-IN'].map((l) => (
                  <Chip
                    key={l}
                    label={l === 'hi-IN' ? 'हिंदी' : 'English'}
                    size="small"
                    clickable
                    onClick={() => setLang(l)}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      border: '1px solid',
                      borderColor: lang === l ? '#8B5CF6' : 'divider',
                      background: lang === l
                        ? 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)'
                        : 'transparent',
                      color: lang === l ? '#fff' : 'text.secondary',
                    }}
                    aria-label={l === 'hi-IN' ? 'Hindi language' : 'English language'}
                  />
                ))}
              </Box>

              {!supported ? (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  {t('voice_notSupported')}
                </Alert>
              ) : (
                <MicOrb listening={listening} reduced={reduced} />
              )}

              {/* Waveform */}
              {listening && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Waveform active={listening} reduced={reduced} />
                </Box>
              )}

              {/* Interim transcript */}
              {(interim || listening) && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    textAlign: 'center',
                    mb: 1,
                    fontStyle: 'italic',
                    minHeight: 20,
                  }}
                >
                  {interim || '...'}
                </Typography>
              )}

              {/* Error */}
              {error && (
                <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.75rem' }}>
                  {error}
                </Alert>
              )}

              {/* Editable transcript */}
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                size="small"
                placeholder={t('voice_orTypePlaceholder')}
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                aria-label="Voice command text"
              />

              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {supported && !listening && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MicIcon sx={{ fontSize: 16 }} />}
                    onClick={handleStartListening}
                    sx={{
                      borderColor: '#A78BFA40',
                      color: '#A78BFA',
                      '&:hover': { borderColor: '#A78BFA', backgroundColor: '#A78BFA10' },
                      flex: 1,
                    }}
                  >
                    {t('voice_startListening')}
                  </Button>
                )}
                {supported && listening && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<StopIcon sx={{ fontSize: 16 }} />}
                    onClick={stop}
                    sx={{
                      borderColor: '#EF444440',
                      color: '#EF4444',
                      '&:hover': { borderColor: '#EF4444', backgroundColor: '#EF444410' },
                      flex: 1,
                    }}
                  >
                    {t('voice_stop')}
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                  onClick={() => handleParse(editableText)}
                  disabled={!editableText.trim()}
                  sx={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)',
                    boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                    flex: 1,
                    '&:hover': { boxShadow: '0 6px 18px rgba(139,92,246,0.5)' },
                  }}
                >
                  {t('voice_understand')}
                </Button>
              </Box>
            </motion.div>
          )}

          {/* ── PARSING SCREEN ── */}
          {screen === 'parsing' && (
            <motion.div
              key="parsing"
              initial={reduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? {} : { opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ color: '#A78BFA', mb: 2 }} />
                <Typography variant="body1" fontWeight={600}>{t('voice_parsing')}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('voice_parsingSubtitle')}
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* ── CONFIRM SCREEN ── */}
          {screen === 'confirm' && parsed && (
            <motion.div
              key="confirm"
              initial={reduced ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? {} : { opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {t('voice_confirmTitle')}
              </Typography>

              {/* Warnings */}
              {parsed.warnings?.length > 0 &&
                parsed.warnings.map((w, i) => (
                  <Alert key={i} severity="warning" icon={<WarningAmberIcon fontSize="small" />} sx={{ mb: 1, borderRadius: 2, fontSize: '0.75rem' }}>
                    {w}
                  </Alert>
                ))}

              {/* requiresMedia */}
              {parsed.requiresMedia && (
                <Alert severity="info" sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.75rem' }}>
                  {t('voice_requiresMedia')}
                </Alert>
              )}

              {/* Post Type */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  {t('voice_postType')}
                </Typography>
                <Chip
                  label={t(`postType_${parsed.postType}`) || parsed.postType}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                    color: '#fff',
                  }}
                />
              </Box>

              {/* Platforms */}
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    color: parsed.missing?.includes('platforms') ? '#EF4444' : 'text.secondary',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  {t('voice_platforms')}
                  {parsed.missing?.includes('platforms') && ' *'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {Object.keys(PLATFORM_COLORS).map((p) => {
                    const rule = POST_RULES[parsed.postType];
                    const allowed = rule?.allowedPlatforms ?? Object.keys(PLATFORM_COLORS);
                    if (!allowed.includes(p)) return null;
                    const isConnected = connectedPlatforms.includes(p);
                    const isSelected = confirmPlatforms.includes(p);
                    const notConnected = parsed.platforms?.includes(p) && !isConnected;
                    const color = PLATFORM_COLORS[p];

                    return (
                      <Chip
                        key={p}
                        aria-label={`${p} platform toggle`}
                        icon={<Box sx={{ color: isSelected ? '#fff' : color, display: 'flex', ml: '4px !important' }}>{PLATFORM_ICONS[p]}</Box>}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                            {notConnected && (
                              <Typography variant="caption" sx={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#EF4444', fontSize: '0.6rem' }}>
                                {t('voice_notConnected')}
                              </Typography>
                            )}
                          </Box>
                        }
                        size="small"
                        clickable={isConnected && allowed.includes(p)}
                        onClick={() => toggleConfirmPlatform(p)}
                        sx={{
                          fontWeight: 600,
                          border: '1px solid',
                          borderColor: isSelected ? color : notConnected ? '#EF4444' : 'divider',
                          background: isSelected ? color : 'transparent',
                          color: isSelected ? '#fff' : notConnected ? '#EF4444' : 'text.secondary',
                          opacity: !isConnected && !notConnected ? 0.4 : 1,
                          cursor: !isConnected ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                        }}
                      />
                    );
                  })}
                </Box>
                {confirmPlatforms.length === 0 && (
                  <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                    {t('voice_selectPlatform')}
                  </Typography>
                )}
              </Box>

              {/* Topic */}
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    color: parsed.missing?.includes('topic') ? '#EF4444' : 'text.secondary',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  {t('voice_topic')}
                  {parsed.missing?.includes('topic') && ' *'}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={confirmTopic}
                  onChange={(e) => setConfirmTopic(e.target.value)}
                  error={!confirmTopic.trim()}
                  helperText={!confirmTopic.trim() ? t('voice_topicRequired') : ''}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  inputProps={{ 'aria-label': 'Post topic' }}
                />
              </Box>

              {/* Schedule */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 0.75 }}>
                  {t('voice_schedule')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  {['schedule', 'now'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt === 'now' ? t('voice_postNow') : t('voice_schedule')}
                      size="small"
                      clickable
                      onClick={() => setPostNow(opt === 'now')}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        border: '1px solid',
                        borderColor: (opt === 'now') === postNow ? '#8B5CF6' : 'divider',
                        background: (opt === 'now') === postNow
                          ? 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)'
                          : 'transparent',
                        color: (opt === 'now') === postNow ? '#fff' : 'text.secondary',
                      }}
                    />
                  ))}
                </Box>
                {!postNow && (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      value={confirmScheduledAt}
                      onChange={setConfirmScheduledAt}
                      disablePast
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              </Box>

              {/* Auto-fill AI checkbox */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <input
                  type="checkbox"
                  id="voice-autofill-ai"
                  checked={autoFillAI}
                  onChange={(e) => setAutoFillAI(e.target.checked)}
                  style={{ accentColor: '#7C3AED', width: 16, height: 16 }}
                />
                <label htmlFor="voice-autofill-ai">
                  <Typography variant="caption" sx={{ cursor: 'pointer', color: 'text.secondary' }}>
                    {t('voice_autoFillCaption')}
                  </Typography>
                </label>
              </Box>

              {/* Confirm + Edit buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<MicIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setScreen('listen')}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.secondary',
                    flex: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {t('voice_editAgain')}
                </Button>
                <Tooltip title={!canConfirm ? t('voice_fillRequired') : ''} arrow>
                  <span style={{ flex: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                      onClick={handleConfirm}
                      disabled={!canConfirm}
                      fullWidth
                      sx={{
                        background: canConfirm
                          ? 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)'
                          : 'rgba(139,92,246,0.3)',
                        boxShadow: canConfirm ? '0 4px 14px rgba(139,92,246,0.35)' : 'none',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {t('voice_confirmFill')}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCommandDialog;
