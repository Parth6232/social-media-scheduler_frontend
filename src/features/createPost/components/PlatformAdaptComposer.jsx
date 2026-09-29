// NEW: multi-platform auto-adapt — Feature 2
import {
  Box, Typography, Tabs, Tab, TextField, Chip, Alert, Skeleton,
  ToggleButton, ToggleButtonGroup, IconButton, Tooltip
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { showToast } from '../../../store/redux/slices/toastSlice';
import { aiApiAction } from '../../ai/aiApiSlice';
import { useTranslation } from '../../../i18n/useTranslation';
import Button from '../../../common/Button';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';

const PLATFORM_META = {
  youtube: {
    label: 'YouTube',
    icon: <YouTubeIcon sx={{ fontSize: 16 }} />,
    color: '#FF0000',
    bg: 'rgba(255,0,0,0.08)',
  },
  instagram: {
    label: 'Instagram',
    icon: <InstagramIcon sx={{ fontSize: 16 }} />,
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.08)',
  },
  facebook: {
    label: 'Facebook',
    icon: <FacebookIcon sx={{ fontSize: 16 }} />,
    color: '#1877F2',
    bg: 'rgba(24,119,242,0.08)',
  },
};

const ADAPT_PLATFORMS = ['youtube', 'instagram', 'facebook'];

// Editable hashtag chips
const HashtagEditor = ({ tags, onChange }) => {
  const [inputVal, setInputVal] = useState('');

  const addTag = () => {
    const cleaned = inputVal.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) onChange([...tags, cleaned]);
    setInputVal('');
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mt: 1 }}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={`#${tag}`}
          size="small"
          onDelete={() => onChange(tags.filter((t) => t !== tag))}
          sx={{
            fontSize: '0.72rem',
            fontWeight: 600,
            backgroundColor: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#A78BFA',
            '& .MuiChip-deleteIcon': { color: 'rgba(167,139,250,0.6)' },
          }}
        />
      ))}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TextField
          size="small"
          placeholder="add tag"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          sx={{
            width: 90,
            '& .MuiOutlinedInput-root': { borderRadius: 4, height: 26, fontSize: '0.72rem' },
          }}
          aria-label="Add hashtag"
        />
        <IconButton size="small" onClick={addTag} aria-label="Add hashtag">
          <AddIcon sx={{ fontSize: 14, color: '#A78BFA' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

const buildContent = (platform, data) => {
  let text = '';
  if (platform === 'youtube') {
    text = [data.title, data.description, (data.hashtags || []).map((h) => `#${h}`).join(' ')]
      .filter(Boolean).join('\n\n');
  } else {
    text = [data.caption, (data.hashtags || []).map((h) => `#${h}`).join(' ')]
      .filter(Boolean).join('\n\n');
  }
  return text.slice(0, 2200);
};

// Skeleton for loading state inside tabs
const TabSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
    <Skeleton variant="rounded" height={40} sx={{ borderRadius: 2 }} />
    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[80, 100, 70].map((w) => (
        <Skeleton key={w} variant="rounded" width={w} height={26} sx={{ borderRadius: 3 }} />
      ))}
    </Box>
  </Box>
);

const PlatformAdaptComposer = ({ selectedPlatforms, setContent, aiTopic }) => {
  const { t, lang } = useTranslation();
  const dispatch = useDispatch();
  const reduced = usePrefersReducedMotion();
  const [generatePlatformContent, { isLoading }] = aiApiAction.generatePlatformContent();

  const defaultTone =
    lang === 'hi' ? 'hindi' : lang === 'hinglish' ? 'hinglish' : 'english';

  const [tone, setTone] = useState(defaultTone);
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState(null); // { youtube: {...}, instagram: {...}, facebook: {...} }
  const [dismissedInfo, setDismissedInfo] = useState(false);

  const adaptPlatforms = selectedPlatforms.filter((p) => ADAPT_PLATFORMS.includes(p));

  // Reset results when platforms change
  useEffect(() => { setResults(null); }, [selectedPlatforms]);

  const handleGenerate = async () => {
    if (adaptPlatforms.length === 0) {
      dispatch(showToast({ message: t('adapt_selectPlatformFirst'), variant: 'warning' }));
      return;
    }
    if (!aiTopic.trim()) {
      dispatch(showToast({ message: t('adapt_enterTopicFirst'), variant: 'warning' }));
      return;
    }
    try {
      const res = await generatePlatformContent({
        topic: aiTopic,
        platforms: adaptPlatforms,
        tone,
      }).unwrap();
      setResults(res.results);
      setActiveTab(0);
    } catch {
      // interceptor shows error toast
    }
  };

  const handleRegenerate = async (platform) => {
    if (!aiTopic.trim()) return;
    try {
      const res = await generatePlatformContent({
        topic: aiTopic,
        platforms: [platform],
        tone,
      }).unwrap();
      if (res.results?.[platform]) {
        setResults((prev) => ({ ...prev, [platform]: res.results[platform] }));
      }
    } catch {
      // interceptor shows error toast
    }
  };

  const updateField = (platform, field, value) => {
    setResults((prev) => ({ ...prev, [platform]: { ...prev[platform], [field]: value } }));
  };

  const handleUseVersion = (platform) => {
    const text = buildContent(platform, results[platform]);
    setContent(text);
    dispatch(showToast({ message: t('adapt_contentApplied').replace('{platform}', PLATFORM_META[platform].label), variant: 'success' }));
  };

  if (adaptPlatforms.length === 0 && !results) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info" icon={<InfoOutlinedIcon fontSize="small" />} sx={{ borderRadius: 2, fontSize: '0.78rem' }}>
          {t('adapt_noPlatformsSelected')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Tone selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary' }}>
          {t('adapt_tone')}:
        </Typography>
        <ToggleButtonGroup
          value={tone}
          exclusive
          onChange={(_, v) => { if (v) setTone(v); }}
          size="small"
          aria-label="Tone selector"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5, py: 0.4, fontSize: '0.7rem', fontWeight: 600,
              borderRadius: '8px !important',
              border: '1px solid rgba(139,92,246,0.25) !important',
              color: 'text.secondary',
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)',
                color: '#fff',
                border: '1px solid transparent !important',
              },
            },
            gap: 0.5,
          }}
        >
          <ToggleButton value="english">{t('adapt_toneEnglish')}</ToggleButton>
          <ToggleButton value="hindi">{t('adapt_toneHindi')}</ToggleButton>
          <ToggleButton value="hinglish">{t('adapt_toneHinglish')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Generate button */}
      <Button
        variant="outlined"
        onClick={handleGenerate}
        loading={isLoading}
        startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
        sx={{
          borderColor: '#A78BFA40',
          color: '#A78BFA',
          mb: 2,
          '&:hover': { borderColor: '#A78BFA', backgroundColor: '#A78BFA10' },
        }}
      >
        {t('adapt_generateBtn')}
      </Button>

      {/* Loading skeletons */}
      {isLoading && !results && (
        <Box>
          {adaptPlatforms.map((p) => (
            <Box key={p} sx={{ mb: 1.5 }}>
              <Skeleton variant="rounded" width={100} height={20} sx={{ mb: 1, borderRadius: 2 }} />
              <TabSkeleton />
            </Box>
          ))}
        </Box>
      )}

      {/* Results tabs */}
      {results && !isLoading && (
        <AnimatePresence mode="wait">
          <motion.div
            key="results"
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Info alert */}
            {!dismissedInfo && (
              <Alert
                severity="info"
                icon={<InfoOutlinedIcon fontSize="small" />}
                action={
                  <IconButton size="small" onClick={() => setDismissedInfo(true)} aria-label="Dismiss">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.75rem', py: 0.5 }}
              >
                {t('adapt_infoNote')}
              </Alert>
            )}

            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                minHeight: 40,
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(90deg, #7C3AED, #D946EF)',
                  height: 3,
                  borderRadius: 2,
                },
                '& .MuiTab-root': {
                  minHeight: 40, fontSize: '0.75rem', fontWeight: 600,
                  textTransform: 'none', px: 1.5, py: 0.5,
                },
              }}
            >
              {adaptPlatforms.filter((p) => results[p]).map((p) => {
                const meta = PLATFORM_META[p];
                return (
                  <Tab
                    key={p}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ color: meta.color }}>{meta.icon}</Box>
                        {meta.label}
                      </Box>
                    }
                    aria-label={meta.label}
                  />
                );
              })}
            </Tabs>

            {adaptPlatforms.filter((p) => results[p]).map((p, idx) => {
              if (idx !== activeTab) return null;
              const meta = PLATFORM_META[p];
              const data = results[p];

              return (
                <AnimatePresence key={p} mode="wait">
                  <motion.div
                    key={p + '-content'}
                    initial={reduced ? {} : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduced ? {} : { opacity: 0, x: -12 }}
                    transition={{ duration: 0.22 }}
                  >
                    {isLoading ? (
                      <TabSkeleton />
                    ) : (
                      <Box>
                        {p === 'youtube' && (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                              <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary' }}>
                                {t('adapt_ytTitle')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: data.title?.length > 95 ? '#F87171' : 'text.disabled' }}>
                                {data.title?.length ?? 0}/100
                              </Typography>
                            </Box>
                            <TextField
                              fullWidth size="small"
                              value={data.title ?? ''}
                              onChange={(e) => updateField(p, 'title', e.target.value.slice(0, 100))}
                              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              inputProps={{ maxLength: 100, 'aria-label': 'YouTube title' }}
                            />
                            <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 0.75 }}>
                              {t('adapt_ytDescription')}
                            </Typography>
                            <TextField
                              fullWidth multiline rows={4} size="small"
                              value={data.description ?? ''}
                              onChange={(e) => updateField(p, 'description', e.target.value)}
                              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              inputProps={{ 'aria-label': 'YouTube description' }}
                            />
                          </>
                        )}
                        {(p === 'instagram' || p === 'facebook') && (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                              <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary' }}>
                                {t('adapt_caption')}
                              </Typography>
                              {p === 'instagram' && (
                                <Typography variant="caption" sx={{ color: (data.caption?.length ?? 0) > 2100 ? '#F87171' : 'text.disabled' }}>
                                  {data.caption?.length ?? 0}/2200
                                </Typography>
                              )}
                            </Box>
                            <TextField
                              fullWidth multiline rows={4} size="small"
                              value={data.caption ?? ''}
                              onChange={(e) => updateField(p, 'caption', p === 'instagram' ? e.target.value.slice(0, 2200) : e.target.value)}
                              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              inputProps={{ 'aria-label': `${meta.label} caption` }}
                            />
                          </>
                        )}

                        {/* Hashtags for all platforms */}
                        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}>
                          {t('adapt_hashtags')}
                        </Typography>
                        <HashtagEditor
                          tags={data.hashtags ?? []}
                          onChange={(tags) => updateField(p, 'hashtags', tags)}
                        />

                        {/* Action buttons */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                            onClick={() => handleUseVersion(p)}
                            sx={{
                              background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                              boxShadow: `0 4px 14px ${meta.color}40`,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              '&:hover': { boxShadow: `0 6px 18px ${meta.color}50` },
                            }}
                          >
                            {t('adapt_useVersion')}
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                            onClick={() => handleRegenerate(p)}
                            loading={isLoading}
                            sx={{
                              borderColor: `${meta.color}40`,
                              color: meta.color,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              '&:hover': { borderColor: meta.color, backgroundColor: `${meta.color}0d` },
                            }}
                          >
                            {t('adapt_regenerate')}
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </motion.div>
                </AnimatePresence>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </Box>
  );
};

export default PlatformAdaptComposer;
