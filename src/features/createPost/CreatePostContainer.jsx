import { Box, Card, CardContent, Typography, Grid, Switch, Chip, Tooltip, TextField, LinearProgress, Checkbox, FormControlLabel, FormGroup, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import ShareIcon from '@mui/icons-material/Share';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { showToast } from '../../store/redux/slices/toastSlice';
import { postApiAction } from './postApiSlice';
import { accountsApiAction } from '../accounts/accountsApiSlice';
import { aiApiAction } from '../ai/aiApiSlice';
import Button from '../../common/Button';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ fontSize: 18 }} />,
  facebook: <FacebookIcon sx={{ fontSize: 18 }} />,
  instagram: <InstagramIcon sx={{ fontSize: 18 }} />,
  linkedin: <LinkedInIcon sx={{ fontSize: 18 }} />,
  twitter: <Box component="span" sx={{ fontSize: 14, fontWeight: 900 }}>𝕏</Box>,
  whatsapp: <WhatsAppIcon sx={{ fontSize: 18 }} />,
};

const PLATFORM_COLORS = {
  youtube: '#FF0000', facebook: '#1877F2', instagram: '#E1306C',
  linkedin: '#0A66C2', twitter: '#ffffff', whatsapp: '#25D366'
};

const AVAILABLE_PLATFORMS = ['youtube', 'facebook', 'instagram'];
const COMING_SOON = ['linkedin', 'twitter', 'whatsapp'];

const CreatePostContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null);

  // NAYA: selected Facebook page ki state
  const [selectedFbPageId, setSelectedFbPageId] = useState('');

  // NAYA: selected Instagram account ki state
  const [selectedIgAccountId, setSelectedIgAccountId] = useState('');

  const [createPost, { isLoading }] = postApiAction.createPost();
  const { data: accounts, isLoading: isAccountsLoading, isError: isAccountsError, refetch: refetchAccounts } = accountsApiAction.getMyAccounts();

  const connectedPlatforms = (accounts || []).map((a) => a.platform);

  // NAYA: user ke saare connected Facebook pages (array)
  const facebookPages = (accounts || []).filter((a) => a.platform === 'facebook');

  // NAYA: user ke saare connected Instagram business accounts (array)
  const instagramAccounts = (accounts || []).filter((a) => a.platform === 'instagram');

  // Facebook chip select/deselect karne par page selection bhi reset
  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) => {
      const newSelected = prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform];
      // Agar Facebook deselect kiya, page selection reset karo
      if (platform === 'facebook' && prev.includes('facebook')) {
        setSelectedFbPageId('');
      }
      // Agar Instagram deselect kiya, account selection reset karo
      if (platform === 'instagram' && prev.includes('instagram')) {
        setSelectedIgAccountId('');
      }
      return newSelected;
    });
  };

  // AI Composer State & Hooks
  const [aiTopic, setAiTopic] = useState('');
  const [aiOptions, setAiOptions] = useState({ caption: true, hashtags: true, image: false });
  const [generateCaption, { isLoading: isGeneratingCaption }] = aiApiAction.generateCaption();
  const [generateImage, { isLoading: isGeneratingImage }] = aiApiAction.generateImage();

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
      let successMessage = 'AI Generation complete! 🎉';

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

        if (res.caption) {
          newContent += res.caption;
        }
        if (res.hashtags && res.hashtags.length > 0) {
          const tagsString = res.hashtags.map(t => `#${t}`).join(' ');
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

      dispatch(showToast({ message: successMessage, variant: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'AI generation failed. Please try again.', variant: 'error' }));
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxFiles: 1,
  });

  // NAYA: Facebook page selection required hai kya?
  const isFbSelected = selectedPlatforms.includes('facebook');
  const isFbPageSelectionRequired = isFbSelected && facebookPages.length >= 2 && !selectedFbPageId;

  // NAYA: Instagram account selection required hai kya?
  const isIgSelected = selectedPlatforms.includes('instagram');
  const isIgAccountSelectionRequired = isIgSelected && instagramAccounts.length >= 2 && !selectedIgAccountId;

  const handleSubmit = async () => {
    if (!content && !file) {
      dispatch(showToast({ message: 'Please add content or upload a media file.', variant: 'warning' }));
      return;
    }
    if (selectedPlatforms.length === 0) {
      dispatch(showToast({ message: 'Please select at least one platform.', variant: 'warning' }));
      return;
    }
    // NAYA: Facebook page validation
    if (isFbPageSelectionRequired) {
      dispatch(showToast({ message: 'Please select a Facebook page to post to.', variant: 'warning' }));
      return;
    }
    // NAYA: Instagram account validation
    if (isIgAccountSelectionRequired) {
      dispatch(showToast({ message: 'Please select an Instagram account to post to.', variant: 'warning' }));
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('privacy', 'public');

    if (scheduleEnabled && scheduledAt) {
      formData.append('scheduledAt', scheduledAt.toISOString());
    }

    // NAYA: facebookPageId backend ko bhejo
    // - 1 page connected: auto-select (no dropdown shown)
    // - 2+ pages connected: user ne dropdown se select kiya
    if (isFbSelected && facebookPages.length > 0) {
      const finalFbPageId = facebookPages.length === 1
        ? facebookPages[0].platformAccountId
        : selectedFbPageId;
      if (finalFbPageId) {
        formData.append('facebookPageId', finalFbPageId);
      }
    }

    // NAYA: instagramPageId backend ko bhejo (same logic as facebookPageId)
    if (isIgSelected && instagramAccounts.length > 0) {
      const finalIgAccountId = instagramAccounts.length === 1
        ? instagramAccounts[0].platformAccountId
        : selectedIgAccountId;
      if (finalIgAccountId) {
        formData.append('instagramPageId', finalIgAccountId);
      }
    }

    if (file) {
      formData.append('media', file);
    }

    try {
      await createPost(formData).unwrap();
      dispatch(showToast({ message: 'Post created successfully! 🚀', variant: 'success' }));
      navigate('/posts');
    } catch (err) {
      // Error is handled by apiSliceInterceptor toast
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AddCircleIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>Create Post</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Compose and publish to your connected platforms</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid size={{ xs: 12, lg: 7 }}>

          {/* AI Composer */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10, 15, 30, 0.4)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AutoAwesomeIcon sx={{ color: '#A78BFA' }} />
                <Typography variant="subtitle2" fontWeight={600}>AI Content Generator</Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter a topic or idea (e.g. 'summer sale announcement')"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 } }}
              />
              <FormGroup row sx={{ mb: 1.5, gap: 1 }}>
                {['caption', 'hashtags', 'image'].map((opt) => (
                  <FormControlLabel
                    key={opt}
                    control={
                      <Checkbox
                        checked={aiOptions[opt]}
                        onChange={(e) => setAiOptions((prev) => ({ ...prev, [opt]: e.target.checked }))}
                        size="small"
                        sx={{ color: '#A78BFA', '&.Mui-checked': { color: '#A78BFA' } }}
                      />
                    }
                    label={<Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{opt}</Typography>}
                  />
                ))}
              </FormGroup>
              {(isGeneratingCaption || isGeneratingImage) && <LinearProgress sx={{ mb: 1, borderRadius: 1, backgroundColor: 'rgba(167,139,250,0.2)', '& .MuiLinearProgress-bar': { backgroundColor: '#A78BFA' } }} />}
              <Button
                variant="outlined"
                onClick={handleGenerateAI}
                loading={isGeneratingCaption || isGeneratingImage}
                sx={{ borderColor: '#A78BFA40', color: '#A78BFA', '&:hover': { borderColor: '#A78BFA', backgroundColor: '#A78BFA10' } }}
              >
                ✨ Generate with AI
              </Button>
            </CardContent>
          </Card>

          {/* Content editor */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10, 15, 30, 0.4)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EditNoteIcon sx={{ color: '#60A5FA' }} />
                <Typography variant="subtitle2" fontWeight={600}>Post Content</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 2200))}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 } }}
              />
              <Typography variant="caption" sx={{ color: content.length > 2000 ? '#F87171' : 'text.secondary', display: 'block', textAlign: 'right', mt: 0.5 }}>
                {content.length}/2200
              </Typography>
            </CardContent>
          </Card>

          {/* Media upload */}
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10, 15, 30, 0.4)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PermMediaIcon sx={{ color: '#F59E0B' }} />
                <Typography variant="subtitle2" fontWeight={600}>Media</Typography>
              </Box>
              {preview ? (
                <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                  {file?.type?.startsWith('video/') ? (
                    <video src={preview} controls style={{ width: '100%', borderRadius: 8, maxHeight: 280, objectFit: 'cover' }} />
                  ) : (
                    <img src={preview} alt="preview" style={{ width: '100%', borderRadius: 8, maxHeight: 280, objectFit: 'cover' }} />
                  )}
                  <Box
                    onClick={() => { setFile(null); setPreview(null); }}
                    sx={{
                      position: 'absolute', top: 8, right: 8, width: 28, height: 28,
                      borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16, color: '#fff' }} />
                  </Box>
                </Box>
              ) : (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: `2px dashed ${isDragActive ? '#7C3AED' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer',
                    backgroundColor: isDragActive ? 'rgba(124, 58, 237, 0.08)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.05)' }
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 40, color: isDragActive ? '#7C3AED' : 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Supports images and videos (max 100 MB)
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, lg: 5 }}>
          {/* Platform selector */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10, 15, 30, 0.4)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShareIcon sx={{ color: '#34D399' }} />
                <Typography variant="subtitle2" fontWeight={600}>Publish To</Typography>
              </Box>

              {/* Accounts loading state */}
              {isAccountsLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CircularProgress size={16} sx={{ color: '#A78BFA' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Loading accounts...</Typography>
                </Box>
              )}

              {/* Accounts error state */}
              {isAccountsError && !isAccountsLoading && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1.5, borderRadius: 2,
                  backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                  <WarningAmberIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                  <Typography variant="caption" sx={{ color: '#ef4444', flex: 1 }}>Failed to load accounts</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={refetchAccounts}
                    sx={{ borderColor: '#ef444440', color: '#ef4444', height: 22, fontSize: '0.65rem', px: 1, minWidth: 'unset', '&:hover': { borderColor: '#ef4444', backgroundColor: '#ef444410' } }}
                  >
                    Retry
                  </Button>
                </Box>
              )}

              {/* Platform chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {AVAILABLE_PLATFORMS.map((p) => {
                  const isPlatformConnected = connectedPlatforms.includes(p);
                  const isSelected = selectedPlatforms.includes(p);
                  const color = PLATFORM_COLORS[p];
                  return (
                    <Tooltip key={p} title={!isPlatformConnected ? `Connect ${p} first in Accounts` : ''} arrow>
                      <span>
                        <Chip
                          icon={<Box sx={{ color: isSelected ? '#fff' : (isPlatformConnected ? color : 'text.disabled'), display: 'flex' }}>{PLATFORM_ICONS[p]}</Box>}
                          label={p.charAt(0).toUpperCase() + p.slice(1)}
                          clickable={isPlatformConnected}
                          onClick={() => isPlatformConnected && togglePlatform(p)}
                          sx={{
                            fontWeight: 600,
                            border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.1)'}`,
                            backgroundColor: isSelected ? color : 'rgba(255,255,255,0.03)',
                            color: isSelected ? '#fff' : (isPlatformConnected ? 'text.primary' : 'text.disabled'),
                            opacity: isPlatformConnected ? 1 : 0.4,
                            cursor: isPlatformConnected ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s',
                            boxShadow: isSelected ? `0 0 12px ${color}50` : 'none',
                            '&:hover': { backgroundColor: isSelected ? color : 'rgba(255,255,255,0.08)' }
                          }}
                        />
                      </span>
                    </Tooltip>
                  );
                })}
                {COMING_SOON.map((p) => (
                  <Tooltip key={p} title="Coming soon" arrow>
                    <Chip
                      icon={<Box sx={{ color: 'text.disabled', display: 'flex' }}>{PLATFORM_ICONS[p]}</Box>}
                      label={p.charAt(0).toUpperCase() + p.slice(1)}
                      sx={{ opacity: 0.3, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'text.disabled', cursor: 'not-allowed' }}
                    />
                  </Tooltip>
                ))}
              </Box>

              {/* NAYA: Facebook Page Selector */}
              {isFbSelected && (
                <Box sx={{ mt: 2 }}>
                  {facebookPages.length === 0 ? (
                    // Koi page connected nahi
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, backgroundColor: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                      <WarningAmberIcon sx={{ fontSize: 16, color: '#FBBF24', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: '#FBBF24' }}>
                        No Facebook pages connected. Go to <Box component="span" onClick={() => navigate('/accounts')} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>Accounts</Box> to connect.
                      </Typography>
                    </Box>
                  ) : facebookPages.length === 1 ? (
                    // Sirf 1 page
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 2, backgroundColor: 'rgba(24, 119, 242, 0.08)', border: '1px solid rgba(24, 119, 242, 0.25)' }}>
                      <FacebookIcon sx={{ fontSize: 14, color: '#1877F2', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: '#93C5FD' }}>
                        Posting to: <Box component="span" sx={{ color: '#fff', fontWeight: 600 }}>{facebookPages[0].displayName}</Box>
                      </Typography>
                    </Box>
                  ) : (
                    // 2+ pages dropdown
                    <FormControl fullWidth size="small" error={isFbPageSelectionRequired} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2, '& fieldset': { borderColor: isFbPageSelectionRequired ? '#ef4444' : 'rgba(24,119,242,0.4)' }, '&:hover fieldset': { borderColor: '#1877F2' }, '&.Mui-focused fieldset': { borderColor: '#1877F2' } }, '& .MuiInputLabel-root': { color: isFbPageSelectionRequired ? '#ef4444' : '#93C5FD' }, '& .MuiInputLabel-root.Mui-focused': { color: '#1877F2' }, '& .MuiSelect-icon': { color: '#93C5FD' } }}>
                      <InputLabel id="fb-page-select-label">{isFbPageSelectionRequired ? 'Select a Facebook page *' : 'Post to which Facebook Page?'}</InputLabel>
                      <Select labelId="fb-page-select-label" id="fb-page-select" value={selectedFbPageId} label={isFbPageSelectionRequired ? 'Select a Facebook page *' : 'Post to which Facebook Page?'} onChange={(e) => setSelectedFbPageId(e.target.value)} MenuProps={{ PaperProps: { sx: { backgroundColor: 'rgba(15, 20, 35, 0.97)', border: '1px solid rgba(24,119,242,0.2)', borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' } } }}>
                        {facebookPages.map((page) => (
                          <MenuItem key={page.platformAccountId} value={page.platformAccountId} sx={{ '&:hover': { backgroundColor: 'rgba(24,119,242,0.12)' }, '&.Mui-selected': { backgroundColor: 'rgba(24,119,242,0.2)' }, '&.Mui-selected:hover': { backgroundColor: 'rgba(24,119,242,0.28)' } }}>
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

              {/* NAYA: Instagram Account Selector */}
              {isIgSelected && (
                <Box sx={{ mt: 2 }}>
                  {instagramAccounts.length === 0 ? (
                    // Koi account connected nahi - warning dikhao
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, backgroundColor: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                      <WarningAmberIcon sx={{ fontSize: 16, color: '#FBBF24', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: '#FBBF24' }}>
                        No Instagram accounts connected. Go to <Box component="span" onClick={() => navigate('/accounts')} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>Accounts</Box> to connect.
                      </Typography>
                    </Box>
                  ) : instagramAccounts.length === 1 ? (
                    // Sirf 1 account - auto-select, subtle info pill dikhao
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 2, backgroundColor: 'rgba(225, 48, 108, 0.08)', border: '1px solid rgba(225, 48, 108, 0.25)' }}>
                      <InstagramIcon sx={{ fontSize: 14, color: '#E1306C', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: '#F9A8D4' }}>
                        Posting to: <Box component="span" sx={{ color: '#fff', fontWeight: 600 }}>{instagramAccounts[0].displayName}</Box>
                      </Typography>
                    </Box>
                  ) : (
                    // 2+ accounts - dropdown dikhao
                    <FormControl fullWidth size="small" error={isIgAccountSelectionRequired} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2, '& fieldset': { borderColor: isIgAccountSelectionRequired ? '#ef4444' : 'rgba(225,48,108,0.4)' }, '&:hover fieldset': { borderColor: '#E1306C' }, '&.Mui-focused fieldset': { borderColor: '#E1306C' } }, '& .MuiInputLabel-root': { color: isIgAccountSelectionRequired ? '#ef4444' : '#F9A8D4' }, '& .MuiInputLabel-root.Mui-focused': { color: '#E1306C' }, '& .MuiSelect-icon': { color: '#F9A8D4' } }}>
                      <InputLabel id="ig-account-select-label">{isIgAccountSelectionRequired ? 'Select an Instagram account *' : 'Post to which Instagram Account?'}</InputLabel>
                      <Select labelId="ig-account-select-label" id="ig-account-select" value={selectedIgAccountId} label={isIgAccountSelectionRequired ? 'Select an Instagram account *' : 'Post to which Instagram Account?'} onChange={(e) => setSelectedIgAccountId(e.target.value)} MenuProps={{ PaperProps: { sx: { backgroundColor: 'rgba(15, 20, 35, 0.97)', border: '1px solid rgba(225,48,108,0.2)', borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' } } }}>
                        {instagramAccounts.map((acc) => (
                          <MenuItem key={acc.platformAccountId} value={acc.platformAccountId} sx={{ '&:hover': { backgroundColor: 'rgba(225,48,108,0.12)' }, '&.Mui-selected': { backgroundColor: 'rgba(225,48,108,0.2)' }, '&.Mui-selected:hover': { backgroundColor: 'rgba(225,48,108,0.28)' } }}>
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

          {/* Schedule toggle */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10, 15, 30, 0.4)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: scheduleEnabled ? 2 : 0 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ color: '#FBBF24' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Schedule for Later</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4 }}>
                    {scheduleEnabled ? 'Pick a date & time below' : 'Post will be published instantly'}
                  </Typography>
                </Box>
                <Switch checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7C3AED' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7C3AED' } }} />
              </Box>

              {scheduleEnabled && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Scheduled date & time"
                    value={scheduledAt}
                    onChange={setScheduledAt}
                    disablePast
                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 } } }, popper: { sx: { '& .MuiPaper-root': { backgroundColor: 'rgba(15, 20, 35, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderRadius: 3 } } } }}
                  />
                </LocalizationProvider>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Tooltip title={isFbPageSelectionRequired ? 'Please select a Facebook page first' : isIgAccountSelectionRequired ? 'Please select an Instagram account first' : ''} arrow>
            <span style={{ display: 'block', width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                loading={isLoading}
                disabled={isFbPageSelectionRequired || isIgAccountSelectionRequired}
                onClick={handleSubmit}
                sx={{
                  py: 2,
                  fontSize: '1.05rem',
                  borderRadius: 3,
                  background: (isFbPageSelectionRequired || isIgAccountSelectionRequired) ? 'rgba(124, 58, 237, 0.3)' : 'linear-gradient(90deg, #7C3AED, #2563EB)',
                  transition: 'all 0.3s ease',
                  boxShadow: (isFbPageSelectionRequired || isIgAccountSelectionRequired) ? 'none' : '0 8px 20px rgba(124, 58, 237, 0.3)',
                  '&:hover': (isFbPageSelectionRequired || isIgAccountSelectionRequired) ? {} : { boxShadow: '0 8px 25px rgba(124, 58, 237, 0.5)', transform: 'translateY(-2px)' }
                }}
              >
                {scheduleEnabled ? '📅 Schedule Post' : '🚀 Publish Now'}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreatePostContainer;
