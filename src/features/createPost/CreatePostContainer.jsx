import { Box, Card, CardContent, Typography, Grid, Switch, FormControlLabel, MenuItem, Select, FormControl, InputLabel, Chip, Tooltip, TextField, LinearProgress } from '@mui/material';
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
  const [privacy, setPrivacy] = useState('public');
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
    formData.append('privacy', privacy);
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
        <Grid item xs={12} lg={7}>
          {/* Content textarea */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Caption / Content</Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                placeholder="What's on your mind? Write your post caption here..."
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" sx={{ color: content.length > charLimit * 0.9 ? '#F59E0B' : 'text.secondary' }}>
                  {content.length} / {charLimit}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Upload box */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Media (Image or Video)</Typography>

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
        <Grid item xs={12} lg={5}>
          {/* Platform selector */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Publish To</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {AVAILABLE_PLATFORMS.map((p) => {
                  const isConnected = connectedPlatforms.includes(p);
                  const isSelected = selectedPlatforms.includes(p);
                  const color = PLATFORM_COLORS[p];
                  return (
                    <Tooltip key={p} title={!isConnected ? `Connect ${p} first in Accounts` : ''} arrow>
                      <span>
                        <Chip
                          icon={<Box sx={{ color: isSelected ? '#fff' : (isConnected ? color : 'text.disabled'), display: 'flex' }}>{PLATFORM_ICONS[p]}</Box>}
                          label={p.charAt(0).toUpperCase() + p.slice(1)}
                          clickable={isConnected}
                          onClick={() => isConnected && togglePlatform(p)}
                          sx={{
                            fontWeight: 600,
                            border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.1)'}`,
                            backgroundColor: isSelected ? `${color}20` : 'rgba(255,255,255,0.03)',
                            color: isSelected ? '#fff' : (isConnected ? 'text.primary' : 'text.disabled'),
                            opacity: isConnected ? 1 : 0.5,
                            cursor: isConnected ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
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
                      sx={{ opacity: 0.4, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'text.disabled', cursor: 'not-allowed' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Schedule toggle */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: scheduleEnabled ? 2 : 0 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>Schedule for Later</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </LocalizationProvider>
              )}
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Privacy</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Privacy</InputLabel>
                <Select value={privacy} label="Privacy" onChange={(e) => setPrivacy(e.target.value)}>
                  <MenuItem value="public">🌍 Public</MenuItem>
                  <MenuItem value="unlisted">🔗 Unlisted</MenuItem>
                  <MenuItem value="private">🔒 Private</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            variant="contained"
            fullWidth
            loading={isLoading}
            onClick={handleSubmit}
            sx={{ py: 1.8, fontSize: '1rem', borderRadius: 2 }}
          >
            {scheduleEnabled ? '📅 Schedule Post' : '🚀 Publish Now'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreatePostContainer;
