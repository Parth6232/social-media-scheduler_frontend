import {
  Box, Card, CardContent, Typography, Grid, Switch, Chip, Tooltip,
  TextField, LinearProgress, Checkbox, FormControlLabel, FormGroup,
  MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import ShareIcon from '@mui/icons-material/Share';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TimerIcon from '@mui/icons-material/Timer';
import { showToast } from '../../store/redux/slices/toastSlice';
import { postApiAction } from './postApiSlice';
import { accountsApiAction } from '../accounts/accountsApiSlice';
import { aiApiAction } from '../ai/aiApiSlice';
import Button from '../../common/Button';
import { useTranslation } from '../../i18n/useTranslation';
import { POST_RULES, isPlatformMediaCompatible } from '../../config/postRules';
import PostTypeSelector from './PostTypeSelector';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ fontSize: 18 }} />,
  facebook: <FacebookIcon sx={{ fontSize: 18 }} />,
  instagram: <InstagramIcon sx={{ fontSize: 18 }} />,
};

const PLATFORM_COLORS = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E1306C',
};

const PLATFORM_NAMES = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

// NAYA: media-kind ke hisab se chip tooltip me dikhane wala label
const MEDIA_KIND_LABELS = {
  none: 'text-only',
  image: 'a photo',
  video: 'a video',
};

// Derive accepted MIME types from mediaType
const getAcceptProp = (mediaType) => {
  if (mediaType === 'image') return { 'image/*': [] };
  if (mediaType === 'video') return { 'video/*': [] };
  if (mediaType === 'both') return { 'image/*': [], 'video/*': [] };
  return {};
};

// Media supports hint i18n key per mediaType
const getMediaSupportsKey = (mediaType) => {
  if (mediaType === 'image') return 'mediaSupportsImages';
  if (mediaType === 'video') return 'mediaSupportsVideos';
  if (mediaType === 'both') return 'mediaSupportsBoth';
  return 'mediaSupports';
};

// Infer submit button label
const getSubmitLabel = (postTypeKey, scheduleEnabled, t) => {
  const rule = POST_RULES[postTypeKey];
  const typeLabel = t(`postType_${postTypeKey}`) || rule?.label || postTypeKey;
  const template = scheduleEnabled
    ? t('schedulePostType')
    : t('publishPostType');
  return template.replace('{type}', typeLabel);
};

const CreatePostContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ─── Step management ───────────────────────────────────────────────
  const [step, setStep] = useState('chooseType'); // 'chooseType' | 'compose'
  const [postType, setPostType] = useState(null);

  // ─── Compose form state ────────────────────────────────────────────
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [selectedFbPageId, setSelectedFbPageId] = useState('');
  const [selectedIgAccountId, setSelectedIgAccountId] = useState('');

  // ─── Duration check state ──────────────────────────────────────────
  const [videoDuration, setVideoDuration] = useState(null);

  // ─── API hooks ─────────────────────────────────────────────────────
  const [createPost, { isLoading }] = postApiAction.createPost();
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    refetch: refetchAccounts,
  } = accountsApiAction.getMyAccounts();

  const connectedPlatforms = (accounts || []).map((a) => a.platform);
  const facebookPages = (accounts || []).filter((a) => a.platform === 'facebook');
  const instagramAccounts = (accounts || []).filter((a) => a.platform === 'instagram');
  const youtubeAccounts = (accounts || []).filter((a) => a.platform === 'youtube');

  // ─── AI Composer ───────────────────────────────────────────────────
  const [aiTopic, setAiTopic] = useState('');
  const [aiOptions, setAiOptions] = useState({ caption: true, hashtags: true, image: false });
  const [generateCaption, { isLoading: isGeneratingCaption }] = aiApiAction.generateCaption();
  const [generateImage, { isLoading: isGeneratingImage }] = aiApiAction.generateImage();

  // ─── Derived rule values ───────────────────────────────────────────
  const rule = postType ? POST_RULES[postType] : null;
  const mediaType = rule?.mediaType ?? null;
  const requiresMedia = rule?.requiresMedia ?? false;
  const maxDurationSeconds = rule?.maxDurationSeconds ?? null;

  // Only show "allowed & connected" platforms in the chips
  const allowedPlatforms = rule?.allowedPlatforms ?? [];

  // NAYA: currently uploaded media ka "kind" -- isse platform chips filter honge
  const currentMediaKind = !file ? 'none' : file.type?.startsWith('video/') ? 'video' : 'image';

  // Duration warning: exceeded?
  const isDurationExceeded =
    maxDurationSeconds !== null && videoDuration !== null && videoDuration > maxDurationSeconds;

  // Reset compose state when going back
  const handleBack = () => {
    setStep('chooseType');
    setPostType(null);
    setContent('');
    setFile(null);
    setPreview(null);
    setSelectedPlatforms([]);
    setScheduleEnabled(false);
    setScheduledAt(null);
    setSelectedFbPageId('');
    setSelectedIgAccountId('');
    setVideoDuration(null);
    setAiTopic('');
    setAiOptions({ caption: true, hashtags: true, image: false });
  };

  const handleSelectType = (type) => {
    setPostType(type);
    setStep('compose');
    // Reset form fields in case user came back and changed type
    setContent('');
    setFile(null);
    setPreview(null);
    setSelectedPlatforms([]);
    setSelectedFbPageId('');
    setSelectedIgAccountId('');
    setVideoDuration(null);
  };

  // ─── Platform toggle ───────────────────────────────────────────────
  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) => {
      const newSelected = prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform];
      if (platform === 'facebook' && prev.includes('facebook')) {
        setSelectedFbPageId('');
      }
      if (platform === 'instagram' && prev.includes('instagram')) {
        setSelectedIgAccountId('');
      }
      return newSelected;
    });
  };

  // ─── File drop + duration probe ─────────────────────────────────────
  const onDrop = useCallback(
    (acceptedFiles) => {
      const f = acceptedFiles[0];
      if (!f) return;
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setVideoDuration(null); // reset until probed
    },
    []
  );

  // Probe video duration whenever a video file is set and maxDuration is relevant
  useEffect(() => {
    if (!file || !file.type.startsWith('video/') || !maxDurationSeconds) {
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.onloadedmetadata = () => {
      setVideoDuration(Math.round(vid.duration));
      URL.revokeObjectURL(objectUrl);
    };
    vid.src = objectUrl;
  }, [file, maxDurationSeconds]);

  // NAYA: jab media badle (ya hata diya jaaye) aur koi already-selected platform
  // us naye media kind ke saath incompatible ho jaaye, use auto-deselect karo
  // aur user ko toast se batao kyun.
  useEffect(() => {
    setSelectedPlatforms((prev) => {
      const stillCompatible = prev.filter((p) => isPlatformMediaCompatible(p, currentMediaKind));
      if (stillCompatible.length !== prev.length) {
        const removed = prev
          .filter((p) => !stillCompatible.includes(p))
          .map((p) => PLATFORM_NAMES[p] || p);
        dispatch(
          showToast({
            message: `${removed.join(', ')} removed — doesn't support ${MEDIA_KIND_LABELS[currentMediaKind]} posts.`,
            variant: 'warning',
          })
        );
      }
      return stillCompatible;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMediaKind]);

  const accept = mediaType ? getAcceptProp(mediaType) : {};
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: mediaType === 'none',
  });

  // ─── AI Handler ────────────────────────────────────────────────────
  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) {
      dispatch(showToast({ message: 'Please enter a topic or idea for AI.', variant: 'warning' }));
      return;
    }
    if (!aiOptions.caption && !aiOptions.hashtags && !aiOptions.image) {
      dispatch(showToast({ message: 'Please select at least one AI option (Caption, Hashtags, Image).', variant: 'warning' }));
      return;
    }
    try {
      if (aiOptions.caption || aiOptions.hashtags) {
        const res = await generateCaption({
          topic: aiTopic,
          platforms: selectedPlatforms,
          includeCaption: aiOptions.caption,
          includeHashtags: aiOptions.hashtags,
        }).unwrap();

        let newContent = content;
        if (newContent && !newContent.endsWith('\n\n') && !newContent.endsWith('\n')) {
          newContent += '\n\n';
        } else if (newContent && newContent.endsWith('\n') && !newContent.endsWith('\n\n')) {
          newContent += '\n';
        }
        if (res.caption) newContent += res.caption;
        if (res.hashtags && res.hashtags.length > 0) {
          const tagsString = res.hashtags.map((tg) => `#${tg}`).join(' ');
          if (res.caption) newContent += '\n\n';
          newContent += tagsString;
        }
        setContent(newContent.slice(0, 2200));
      }

      if (aiOptions.image) {
        const res = await generateImage({ topic: aiTopic }).unwrap();
        if (res.image) {
          const fetchRes = await fetch(res.image);
          const blob = await fetchRes.blob();
          const generatedFile = new File([blob], 'ai-generated-image.jpg', { type: blob.type });
          setFile(generatedFile);
          setPreview(URL.createObjectURL(generatedFile));
        }
      }

      dispatch(showToast({ message: 'AI Generation complete! 🎉', variant: 'success' }));
    } catch {
      dispatch(showToast({ message: 'AI generation failed. Please try again.', variant: 'error' }));
    }
  };

  // ─── Submit validation & submit ────────────────────────────────────
  const isFbSelected = selectedPlatforms.includes('facebook');
  const isYtSelected = selectedPlatforms.includes('youtube');
  const isFbPageSelectionRequired = isFbSelected && facebookPages.length >= 2 && !selectedFbPageId;

  const isIgSelected = selectedPlatforms.includes('instagram');
  const isIgAccountSelectionRequired = isIgSelected && instagramAccounts.length >= 2 && !selectedIgAccountId;

  const isSubmitDisabled =
    isLoading ||
    !content.trim() ||
    (requiresMedia && !file) ||
    selectedPlatforms.length === 0 ||
    isFbPageSelectionRequired ||
    isIgAccountSelectionRequired ||
    isDurationExceeded;

  const handleSubmit = async () => {
    if (!content.trim()) {
      dispatch(showToast({ message: 'Please add post content.', variant: 'warning' }));
      return;
    }
    if (selectedPlatforms.length === 0) {
      dispatch(showToast({ message: 'Please select at least one platform.', variant: 'warning' }));
      return;
    }
    if (requiresMedia && !file) {
      dispatch(showToast({ message: 'Please upload a media file for this post type.', variant: 'warning' }));
      return;
    }
    if (isFbPageSelectionRequired) {
      dispatch(showToast({ message: 'Please select a Facebook page to post to.', variant: 'warning' }));
      return;
    }
    if (isIgAccountSelectionRequired) {
      dispatch(showToast({ message: 'Please select an Instagram account to post to.', variant: 'warning' }));
      return;
    }
    if (isDurationExceeded) {
      dispatch(showToast({ message: t('durationWarning').replace('{seconds}', String(maxDurationSeconds)), variant: 'warning' }));
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('postType', postType);
    formData.append('privacy', 'public');

    if (scheduleEnabled && scheduledAt) {
      formData.append('scheduledAt', scheduledAt.toISOString());
    }

    if (isFbSelected && facebookPages.length > 0) {
      const finalFbPageId =
        facebookPages.length === 1 ? facebookPages[0].platformAccountId : selectedFbPageId;
      if (finalFbPageId) formData.append('facebookPageId', finalFbPageId);
    }

    if (isIgSelected && instagramAccounts.length > 0) {
      const finalIgAccountId =
        instagramAccounts.length === 1 ? instagramAccounts[0].platformAccountId : selectedIgAccountId;
      if (finalIgAccountId) formData.append('instagramPageId', finalIgAccountId);
    }

    if (file) {
      formData.append('media', file);
    }

    try {
      const res = await createPost(formData).unwrap();

      // NAYA: pehle hamesha generic "Post created successfully!" dikhta tha,
      // chahe kisi bhi platform par fail ho jaaye. Ab res.post.targets se
      // per-platform status padhke exact batate hain ki kahan success hua
      // aur kahan fail (aur kyun).
      const platformLabel = (p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p);

      if (res?.instant === false) {
        // Scheduled ke liye baad mein publish hoga -- targets abhi "pending" hain.
        dispatch(showToast({ message: 'Post scheduled successfully! 🚀', variant: 'success' }));
      } else {
        const targets = res?.post?.targets || [];
        const succeeded = targets.filter((t) => t.status === 'published').map((t) => platformLabel(t.platform));
        const failed = targets.filter((t) => t.status === 'failed');

        if (failed.length === 0) {
          dispatch(showToast({ message: `Post created successfully in ${succeeded.join(', ')}! 🚀`, variant: 'success' }));
        } else if (succeeded.length === 0) {
          const failedText = failed.map((t) => `${platformLabel(t.platform)}${t.error ? ` (${t.error})` : ''}`).join(', ');
          dispatch(showToast({ message: `Post failed: ${failedText}`, variant: 'error' }));
        } else {
          const failedText = failed.map((t) => `${platformLabel(t.platform)}${t.error ? ` (${t.error})` : ''}`).join(', ');
          dispatch(
            showToast({
              message: `Post created successfully in ${succeeded.join(', ')} but failed in ${failedText}`,
              variant: 'warning',
            })
          );
        }
      }

      handleBack(); // reset to step 1
    } catch {
      // Error toast is already shown by the API interceptor
    }
  };

  // ─── Gate AI "image" option ────────────────────────────────────────
  // Show image AI option only when mediaType allows images
  const showAiImageOption = mediaType === 'image' || mediaType === 'both' || postType === 'feed' || postType === 'photo' || postType === 'story';

  // ─── Render ────────────────────────────────────────────────────────
  if (step === 'chooseType') {
    return <PostTypeSelector onSelectType={handleSelectType} />;
  }

  // ── Step 2: Compose ─────────────────────────────────────────────────
  const currentRule = POST_RULES[postType];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{
            minWidth: 'unset',
            px: 1.5,
            py: 1,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: '#7C3AED',
              color: '#7C3AED',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.04)',
            },
          }}
        >
          <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {t('backToTypes')}
          </Box>
        </Button>

        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AddCircleIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t(`postType_${postType}`) || currentRule?.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('createPostSubtitle')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* ── Left Column ──────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 7 }}>

          {/* AI Composer */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AutoAwesomeIcon sx={{ color: '#A78BFA' }} />
                <Typography variant="subtitle2" fontWeight={600}>{t('aiContentGenerator')}</Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder={t('aiTopicPlaceholder')}
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <FormGroup row sx={{ mb: 1.5, gap: 1 }}>
                {['caption', 'hashtags', 'image'].map((opt) => {
                  // Hide the image AI checkbox when mediaType is none or video
                  if (opt === 'image' && !showAiImageOption) return null;
                  return (
                    <FormControlLabel
                      key={opt}
                      control={
                        <Checkbox
                          checked={aiOptions[opt]}
                          onChange={(e) =>
                            setAiOptions((prev) => ({ ...prev, [opt]: e.target.checked }))
                          }
                          size="small"
                          sx={{ color: '#A78BFA', '&.Mui-checked': { color: '#A78BFA' } }}
                        />
                      }
                      label={<Typography variant="caption">{t(opt)}</Typography>}
                    />
                  );
                })}
              </FormGroup>
              {(isGeneratingCaption || isGeneratingImage) && (
                <LinearProgress
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.1)',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#A78BFA' },
                  }}
                />
              )}
              <Button
                variant="outlined"
                onClick={handleGenerateAI}
                loading={isGeneratingCaption || isGeneratingImage}
                sx={{
                  borderColor: '#A78BFA40',
                  color: '#A78BFA',
                  '&:hover': { borderColor: '#A78BFA', backgroundColor: '#A78BFA10' },
                }}
              >
                {t('generateWithAi')}
              </Button>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EditNoteIcon sx={{ color: '#60A5FA' }} />
                <Typography variant="subtitle2" fontWeight={600}>{t('postContent')}</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder={t('postContentPlaceholder')}
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 2200))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: content.length > 2000 ? '#F87171' : 'text.secondary',
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5,
                }}
              >
                {content.length}/2200
              </Typography>
            </CardContent>
          </Card>

          {/* Media Upload — only when mediaType !== 'none' */}
          {mediaType !== 'none' && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PermMediaIcon sx={{ color: '#F59E0B' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t('media')}
                    {requiresMedia && (
                      <Box
                        component="span"
                        sx={{ ml: 1, fontSize: '0.7rem', color: '#EF4444', fontWeight: 600 }}
                      >
                        *
                      </Box>
                    )}
                  </Typography>
                </Box>

                {/* Required/hint caption */}
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                  {requiresMedia ? t('mediaRequired') : t(getMediaSupportsKey(mediaType))}
                </Typography>

                {/* Duration exceeded warning */}
                {isDurationExceeded && (
                  <Alert
                    severity="warning"
                    icon={<TimerIcon fontSize="inherit" />}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(245, 158, 11, 0.12)'
                          : 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      '& .MuiAlert-message': { fontSize: '0.8rem', fontWeight: 500 },
                    }}
                  >
                    {t('durationWarning').replace('{seconds}', String(maxDurationSeconds))}
                    {videoDuration && (
                      <Box component="span" sx={{ ml: 1, fontWeight: 700 }}>
                        ({videoDuration}s)
                      </Box>
                    )}
                  </Alert>
                )}

                {preview ? (
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                    {file?.type?.startsWith('video/') ? (
                      <video
                        src={preview}
                        controls
                        style={{ width: '100%', borderRadius: 8, maxHeight: 280, objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="preview"
                        style={{ width: '100%', borderRadius: 8, maxHeight: 280, objectFit: 'cover' }}
                      />
                    )}
                    <Box
                      onClick={() => { setFile(null); setPreview(null); setVideoDuration(null); }}
                      sx={{
                        position: 'absolute', top: 8, right: 8,
                        width: 28, height: 28, borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16, color: '#fff' }} />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: '2px dashed',
                      borderColor: isDurationExceeded
                        ? '#F59E0B'
                        : isDragActive
                          ? '#7C3AED'
                          : requiresMedia && !file
                            ? 'rgba(239, 68, 68, 0.4)'
                            : 'divider',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isDragActive
                        ? 'rgba(124, 58, 237, 0.08)'
                        : (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.02)'
                            : 'rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#7C3AED',
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(124, 58, 237, 0.08)'
                            : 'rgba(124, 58, 237, 0.04)',
                      },
                    }}
                  >
                    <input {...getInputProps()} />
                    <CloudUploadIcon
                      sx={{
                        fontSize: 40,
                        color: isDragActive ? '#7C3AED' : 'text.secondary',
                        mb: 1,
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {isDragActive ? t('dropItHere') : t('dragDropOrClick')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t(getMediaSupportsKey(mediaType))}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* ── Right Column ─────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 5 }}>

          {/* Platform Selector */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShareIcon sx={{ color: '#34D399' }} />
                <Typography variant="subtitle2" fontWeight={600}>{t('publishTo')}</Typography>
              </Box>

              {/* Loading state */}
              {isAccountsLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CircularProgress size={16} sx={{ color: '#A78BFA' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('loadingAccounts')}
                  </Typography>
                </Box>
              )}

              {/* Error state */}
              {isAccountsError && (
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1,
                    borderRadius: 1,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <WarningAmberIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                  <Typography variant="caption" sx={{ color: '#ef4444', flex: 1 }}>
                    {t('failedToLoadAccounts')}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={refetchAccounts}
                    sx={{
                      borderColor: '#ef444440', color: '#ef4444', height: 22,
                      fontSize: '0.65rem', px: 1, minWidth: 'unset',
                      '&:hover': { borderColor: '#ef4444', backgroundColor: '#ef444410' },
                    }}
                  >
                    {t('retry')}
                  </Button>
                </Box>
              )}

              {/* Platform chips — only allowedPlatforms for this postType */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allowedPlatforms.map((p) => {
                  const isPlatformConnected = connectedPlatforms.includes(p);
                  const isSelected = selectedPlatforms.includes(p);
                  const color = PLATFORM_COLORS[p];
                  const name = PLATFORM_NAMES[p] || p;
                  // NAYA: connected hone ke baad bhi, kya ye platform current media
                  // (none/image/video) ke saath compatible hai? (e.g. YouTube + photo)
                  const isMediaIncompatible = isPlatformConnected && !isPlatformMediaCompatible(p, currentMediaKind);

                  if (!isPlatformConnected) {
                    // Show greyed-out chip with "Connect first" link
                    return (
                      <Tooltip
                        key={p}
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption">
                              {t('connectFirst')} →{' '}
                              <Box
                                component="span"
                                onClick={() => navigate('/accounts')}
                                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                              >
                                {t('accounts')}
                              </Box>
                            </Typography>
                          </Box>
                        }
                        arrow
                      >
                        <span>
                          <Chip
                            icon={
                              <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                                {PLATFORM_ICONS[p]}
                              </Box>
                            }
                            label={
                              <span>
                                {name}{' '}
                                <Box
                                  component="span"
                                  onClick={(e) => { e.stopPropagation(); navigate('/accounts'); }}
                                  sx={{
                                    color: 'primary.main',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    ml: 0.5,
                                  }}
                                >
                                  {t('connectFirst')}
                                </Box>
                              </span>
                            }
                            sx={{
                              fontWeight: 600,
                              border: '1px solid',
                              borderColor: 'divider',
                              backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.02)'
                                  : 'rgba(0,0,0,0.02)',
                              color: 'text.disabled',
                              opacity: 0.5,
                              cursor: 'default',
                            }}
                          />
                        </span>
                      </Tooltip>
                    );
                  }

                  if (isMediaIncompatible) {
                    return (
                      <Tooltip
                        key={p}
                        title={`${name} doesn't support ${MEDIA_KIND_LABELS[currentMediaKind]} posts. Remove this platform or change the media.`}
                        arrow
                      >
                        <span>
                          <Chip
                            icon={
                              <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                                {PLATFORM_ICONS[p]}
                              </Box>
                            }
                            label={name}
                            sx={{
                              fontWeight: 600,
                              border: '1px dashed',
                              borderColor: 'divider',
                              backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.02)'
                                  : 'rgba(0,0,0,0.02)',
                              color: 'text.disabled',
                              opacity: 0.5,
                              cursor: 'not-allowed',
                            }}
                          />
                        </span>
                      </Tooltip>
                    );
                  }

                  return (
                    <Chip
                      key={p}
                      icon={
                        <Box sx={{ color: isSelected ? '#fff' : color, display: 'flex' }}>
                          {PLATFORM_ICONS[p]}
                        </Box>
                      }
                      label={name}
                      clickable
                      onClick={() => togglePlatform(p)}
                      sx={{
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: isSelected ? color : 'divider',
                        backgroundColor: isSelected
                          ? color
                          : (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.03)'
                              : 'rgba(0,0,0,0.03)',
                        color: isSelected ? '#fff' : 'text.primary',
                        transition: 'all 0.3s',
                        boxShadow: isSelected ? `0 0 12px ${color}50` : 'none',
                        '&:hover': {
                          backgroundColor: isSelected
                            ? color
                            : (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(0,0,0,0.06)',
                        },
                      }}
                    />
                  );
                })}
              </Box>

              {/* YouTube Account Indicator */}
              {isYtSelected && allowedPlatforms.includes('youtube') && (
                <Box sx={{ mt: 2 }}>
                  {youtubeAccounts.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                      }}
                    >
                      <WarningAmberIcon sx={{ fontSize: 16, color: '#FBBF24', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.primary' }}>
                        No YouTube account connected.{' '}
                        <Box
                          component="span"
                          onClick={() => navigate('/accounts')}
                          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {t('accounts')}
                        </Box>
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1.25,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 0, 0, 0.25)',
                      }}
                    >
                      <YouTubeIcon sx={{ fontSize: 14, color: '#FF0000', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('postingTo')}{' '}
                        <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          {youtubeAccounts[0].displayName}
                        </Box>
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Facebook Page Selector */}
              {isFbSelected && allowedPlatforms.includes('facebook') && (
                <Box sx={{ mt: 2 }}>
                  {facebookPages.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                      }}
                    >
                      <WarningAmberIcon sx={{ fontSize: 16, color: '#FBBF24', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.primary' }}>
                        {t('noFbPagesConnected')}{' '}
                        <Box
                          component="span"
                          onClick={() => navigate('/accounts')}
                          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {t('accounts')}
                        </Box>
                      </Typography>
                    </Box>
                  ) : facebookPages.length === 1 ? (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1.25,
                        borderRadius: 2,
                        backgroundColor: 'rgba(24, 119, 242, 0.1)',
                        border: '1px solid rgba(24, 119, 242, 0.25)',
                      }}
                    >
                      <FacebookIcon sx={{ fontSize: 14, color: '#1877F2', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('postingTo')}{' '}
                        <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          {facebookPages[0].displayName}
                        </Box>
                      </Typography>
                    </Box>
                  ) : (
                    <FormControl fullWidth size="small" error={isFbPageSelectionRequired} sx={{ mt: 1 }}>
                      <InputLabel id="fb-page-select-label">
                        {isFbPageSelectionRequired ? t('selectFbPageRequired') : t('postToWhichFbPage')}
                      </InputLabel>
                      <Select
                        labelId="fb-page-select-label"
                        id="fb-page-select"
                        value={selectedFbPageId}
                        label={isFbPageSelectionRequired ? t('selectFbPageRequired') : t('postToWhichFbPage')}
                        onChange={(e) => setSelectedFbPageId(e.target.value)}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: 'background.paper',
                              border: '1px solid', borderColor: 'divider',
                              borderRadius: 2, boxShadow: 6,
                            },
                          },
                        }}
                      >
                        {facebookPages.map((page) => (
                          <MenuItem
                            key={page.platformAccountId}
                            value={page.platformAccountId}
                            sx={{ '&:hover': { backgroundColor: 'rgba(24,119,242,0.08)' } }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FacebookIcon sx={{ fontSize: 16, color: '#1877F2' }} />
                              <Typography variant="body2">{page.displayName}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              )}

              {/* Instagram Account Selector */}
              {isIgSelected && allowedPlatforms.includes('instagram') && (
                <Box sx={{ mt: 2 }}>
                  {instagramAccounts.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                      }}
                    >
                      <WarningAmberIcon sx={{ fontSize: 16, color: '#FBBF24', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.primary' }}>
                        {t('noIgAccountsConnected')}{' '}
                        <Box
                          component="span"
                          onClick={() => navigate('/accounts')}
                          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {t('accounts')}
                        </Box>
                      </Typography>
                    </Box>
                  ) : instagramAccounts.length === 1 ? (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1.25,
                        borderRadius: 2,
                        backgroundColor: 'rgba(225, 48, 108, 0.1)',
                        border: '1px solid rgba(225, 48, 108, 0.25)',
                      }}
                    >
                      <InstagramIcon sx={{ fontSize: 14, color: '#E1306C', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('postingTo')}{' '}
                        <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          {instagramAccounts[0].displayName}
                        </Box>
                      </Typography>
                    </Box>
                  ) : (
                    <FormControl fullWidth size="small" error={isIgAccountSelectionRequired} sx={{ mt: 1 }}>
                      <InputLabel id="ig-account-select-label">
                        {isIgAccountSelectionRequired ? t('selectIgAccountRequired') : t('postToWhichIgAccount')}
                      </InputLabel>
                      <Select
                        labelId="ig-account-select-label"
                        id="ig-account-select"
                        value={selectedIgAccountId}
                        label={isIgAccountSelectionRequired ? t('selectIgAccountRequired') : t('postToWhichIgAccount')}
                        onChange={(e) => setSelectedIgAccountId(e.target.value)}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: 'background.paper',
                              border: '1px solid', borderColor: 'divider',
                              borderRadius: 2, boxShadow: 6,
                            },
                          },
                        }}
                      >
                        {instagramAccounts.map((acc) => (
                          <MenuItem
                            key={acc.platformAccountId}
                            value={acc.platformAccountId}
                            sx={{ '&:hover': { backgroundColor: 'rgba(225,48,108,0.08)' } }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <InstagramIcon sx={{ fontSize: 16, color: '#E1306C' }} />
                              <Typography variant="body2">{acc.displayName}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Schedule Toggle */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: scheduleEnabled ? 2 : 0 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ color: '#F59E0B' }} />
                    <Typography variant="subtitle2" fontWeight={600}>{t('scheduleForLater')}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4 }}>
                    {scheduleEnabled ? t('pickDateTimeBelow') : t('postPublishedInstantly')}
                  </Typography>
                </Box>
                <Switch
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#7C3AED' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7C3AED' },
                  }}
                />
              </Box>
              {scheduleEnabled && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label={t('scheduledDateTime')}
                    value={scheduledAt}
                    onChange={setScheduledAt}
                    disablePast
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                      },
                      popper: {
                        sx: {
                          '& .MuiPaper-root': {
                            bgcolor: 'background.paper',
                            border: '1px solid', borderColor: 'divider',
                            boxShadow: 8, borderRadius: 3,
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Tooltip
            title={
              isFbPageSelectionRequired
                ? t('selectFbPageRequired')
                : isIgAccountSelectionRequired
                  ? t('selectIgAccountRequired')
                  : isDurationExceeded
                    ? t('durationWarning').replace('{seconds}', String(maxDurationSeconds))
                    : ''
            }
            arrow
          >
            <span style={{ display: 'block', width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                loading={isLoading}
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
                sx={{
                  py: 2,
                  fontSize: '1.05rem',
                  borderRadius: 3,
                  background: isSubmitDisabled
                    ? 'rgba(124, 58, 237, 0.3)'
                    : 'linear-gradient(90deg, #7C3AED, #2563EB)',
                  transition: 'all 0.3s ease',
                  boxShadow: isSubmitDisabled ? 'none' : '0 8px 20px rgba(124, 58, 237, 0.3)',
                  '&:hover': isSubmitDisabled
                    ? {}
                    : {
                      boxShadow: '0 8px 25px rgba(124, 58, 237, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                }}
              >
                {getSubmitLabel(postType, scheduleEnabled, t)}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreatePostContainer;