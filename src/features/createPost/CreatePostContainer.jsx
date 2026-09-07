import { Box, Card, CardContent, Typography, Grid, Switch, Chip, Tooltip, TextField, LinearProgress } from '@mui/material';
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
import { showToast } from '../../store/redux/slices/toastSlice';
import { postApiAction } from './postApiSlice';
import { accountsApiAction } from '../accounts/accountsApiSlice';
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
  const [createPost, { isLoading }] = postApiAction.createPost();
  const { data: accounts } = accountsApiAction.getMyAccounts();

  const connectedPlatforms = (accounts || []).map((a) => a.platform);

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

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = async () => {
    if (!content && !file) {
      dispatch(showToast({ message: 'Please add content or upload a media file.', variant: 'warning' }));
      return;
    }
    if (selectedPlatforms.length === 0) {
      dispatch(showToast({ message: 'Please select at least one platform.', variant: 'warning' }));
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('privacy', 'public'); // Hardcoded privacy to public silently

    if (scheduleEnabled && scheduledAt) {
      formData.append('scheduledAt', scheduledAt.toISOString());
    }
    if (file) {
      formData.append('video', file);
    }

    try {
      await createPost(formData).unwrap();
      dispatch(showToast({ message: scheduleEnabled ? 'Post scheduled! 📅' : 'Post created! 🚀', variant: 'success' }));
      navigate('/posts');
    } catch {
      // Handled by interceptor
    }
  };

  const charLimit = 2200;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AddCircleIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>Create Post</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 7 }}>
          Craft and schedule your content across multiple platforms
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid size={{ xs: 12, lg: 7 }}>
          {/* Content textarea */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10, 15, 30, 0.4)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EditNoteIcon sx={{ color: '#A78BFA' }} />
                <Typography variant="subtitle2" fontWeight={600}>Caption / Content</Typography>
              </Box>
              <TextField
                multiline
                rows={6}
                fullWidth
                placeholder="What's on your mind? Write your post caption here..."
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
                variant="outlined"
                sx={{ mb: 1, '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.02)' } }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" sx={{ color: content.length > charLimit * 0.9 ? '#F59E0B' : 'text.secondary' }}>
                  {content.length} / {charLimit}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Upload box */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10, 15, 30, 0.4)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PermMediaIcon sx={{ color: '#60A5FA' }} />
                <Typography variant="subtitle2" fontWeight={600}>Media (Image or Video)</Typography>
              </Box>

              {preview ? (
                <Box sx={{ position: 'relative' }}>
                  {file?.type?.startsWith('video') ? (
                    <Box component="video" src={preview} controls sx={{ width: '100%', borderRadius: 2, maxHeight: 300 }} />
                  ) : (
                    <Box component="img" src={preview} alt="preview" sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 2 }} />
                  )}
                  <Box
                    onClick={() => { setFile(null); setPreview(null); }}
                    sx={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(239,68,68,0.7)' } }}
                  >
                    <CloseIcon sx={{ fontSize: 16, color: '#fff' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                    {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
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

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {AVAILABLE_PLATFORMS.map((p) => {
                  const isConnected = connectedPlatforms.includes(p) || connectedPlatforms.includes(p === 'instagram' || p === 'facebook' ? 'facebook_instagram' : p) || (p === 'instagram' && connectedPlatforms.includes('facebook'));
                  // We handled combo platform, now connectedPlatforms returns 'facebook', 'youtube', etc
                  const isPlatformConnected = connectedPlatforms.includes(p) || (connectedPlatforms.includes('facebook') && p === 'instagram');

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
                            '&:hover': {
                              backgroundColor: isSelected ? color : 'rgba(255,255,255,0.08)'
                            }
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
                <Switch
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7C3AED' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7C3AED' } }}
                />
              </Box>

              {scheduleEnabled && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Scheduled date & time"
                    value={scheduledAt}
                    onChange={setScheduledAt}
                    disablePast
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 2
                          }
                        }
                      },
                      popper: {
                        sx: {
                          '& .MuiPaper-root': {
                            backgroundColor: 'rgba(15, 20, 35, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            borderRadius: 3
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            variant="contained"
            fullWidth
            loading={isLoading}
            onClick={handleSubmit}
            sx={{
              py: 2,
              fontSize: '1.05rem',
              borderRadius: 3,
              background: 'linear-gradient(90deg, #7C3AED, #2563EB)',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(124, 58, 237, 0.5)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {scheduleEnabled ? '📅 Schedule Post' : '🚀 Publish Now'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreatePostContainer;
