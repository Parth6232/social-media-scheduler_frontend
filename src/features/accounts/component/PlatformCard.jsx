import { Box, Card, CardContent, Typography, Chip, Skeleton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useSelector } from 'react-redux';
import { appConstants } from '../../../constant/appConstants';
import Button from '../../../common/Button';
import { accountsApiAction } from '../accountsApiSlice';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ fontSize: 36 }} />,
  facebook: <FacebookIcon sx={{ fontSize: 36 }} />,
  instagram: <InstagramIcon sx={{ fontSize: 36 }} />,
  linkedin: <LinkedInIcon sx={{ fontSize: 36 }} />,
  twitter: <Box component="span" sx={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>𝕏</Box>,
  whatsapp: <WhatsAppIcon sx={{ fontSize: 36 }} />,
};

const PLATFORM_COLORS = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  twitter: '#ffffff',
  whatsapp: '#25D366',
};

const PlatformCard = ({ platform, connectedAccount, isLoading }) => {
  const user = useSelector((state) => state.auth.user);
  const [disconnectAccount] = accountsApiAction.disconnectAccount();

  const isCombo = platform === 'facebook_instagram';
  const meta = isCombo ? { name: 'Facebook & Instagram', isComingSoon: false } : appConstants.platforms[platform];

  const fbAccount = isCombo ? connectedAccount?.facebook : null;
  const igAccount = isCombo ? connectedAccount?.instagram : null;
  const isConnected = isCombo ? !!(fbAccount || igAccount) : !!connectedAccount;
  const color = isCombo ? '#1877F2' : PLATFORM_COLORS[platform];

  const handleConnect = () => {
    const userId = user?.userId || (isCombo ? (fbAccount?.userId || igAccount?.userId) : connectedAccount?.userId);
    const targetPlatform = isCombo ? 'facebook' : platform;
    const endpointMap = {
      youtube: `${appConstants.apiBaseURL}/auth/youtube/connect?userId=${userId}`,
      facebook: `${appConstants.apiBaseURL}/auth/facebook/connect?userId=${userId}`,
    };
    if (endpointMap[targetPlatform]) {
      window.location.href = endpointMap[targetPlatform];
    }
  };

  // Single-platform disconnect (YouTube, etc.)
  const handleDisconnectSingle = async (targetPlatform) => {
    if (!window.confirm(`Are you sure you want to disconnect ${targetPlatform}?`)) return;
    try {
      await disconnectAccount(targetPlatform).unwrap();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  // Combined Facebook & Instagram disconnect
  const handleDisconnectCombo = async () => {
    if (!window.confirm('Are you sure you want to disconnect Facebook & Instagram?')) return;
    try {
      if (fbAccount) await disconnectAccount('facebook').unwrap();
      if (igAccount) await disconnectAccount('instagram').unwrap();
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ p: 2, borderRadius: 3 }}>
        <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1, mx: 'auto' }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mx: 'auto' }} />
        <Skeleton variant="text" width="80%" height={18} sx={{ mx: 'auto' }} />
        <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 2 }} />
      </Card>
    );
  }

  // Status row (checkmark + name) — no disconnect button here for combo
  const renderStatusRow = (acc, label) => (
    acc ? (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
        <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />
        <Typography variant="caption" sx={{ color: '#4ade80' }}>
          {label ? `${label}: ` : ''}{acc.displayName || 'Connected'}
        </Typography>
      </Box>
    ) : (
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mb: 0.5 }}>
        {label ? `${label}: ` : ''}Not connected
      </Typography>
    )
  );

  return (
    <Card sx={{
      borderRadius: 3,
      border: isConnected ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': meta.isComingSoon ? {} : {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 40px ${color}25`,
      },
      opacity: meta.isComingSoon ? 0.6 : 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Colored top strip when connected */}
      {isConnected && (
        <Box sx={{ height: 3, background: isCombo ? 'linear-gradient(90deg, #1877F2, #E1306C)' : (color === '#E1306C' ? 'linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' : color) }} />
      )}

      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Coming soon badge */}
        {meta.isComingSoon && (
          <Chip
            label="Coming Soon"
            size="small"
            sx={{
              position: 'absolute', top: 12, right: 12,
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'text.secondary', fontSize: '0.65rem', height: 20,
            }}
          />
        )}

        {/* Icon(s) — center aligned */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, justifyContent: 'center', color: meta.isComingSoon ? 'text.secondary' : color }}>
          {isCombo ? (
            <>
              <Box sx={{ color: '#1877F2' }}>{PLATFORM_ICONS.facebook}</Box>
              <Box sx={{ color: '#E1306C' }}>{PLATFORM_ICONS.instagram}</Box>
            </>
          ) : PLATFORM_ICONS[platform]}
        </Box>

        {/* Platform name — center aligned */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, textAlign: 'center' }}>
          {meta.name}
        </Typography>

        {/* Status area */}
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: !isConnected ? 'center' : 'flex-start' }}>
          {isCombo ? (
            isConnected ? (
              <Box sx={{ width: '100%', mb: 1 }}>
                {renderStatusRow(fbAccount, 'Facebook')}
                {renderStatusRow(igAccount, 'Instagram')}
              </Box>
            ) : null
          ) : (
            isConnected ? renderStatusRow(connectedAccount, '') : null
          )}
        </Box>

        {/* Action button — always at bottom, centered */}
        <Box sx={{ mt: 'auto', width: '100%' }}>
          {meta.isComingSoon ? (
            <Box sx={{
              py: 1, textAlign: 'center', borderRadius: 1,
              border: '1px dashed rgba(255,255,255,0.1)',
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Coming soon</Typography>
            </Box>
          ) : isConnected ? (
            // Disconnect button
            <Tooltip title={isCombo ? 'Disconnect Facebook & Instagram' : `Disconnect ${meta.name}`}>
              <span style={{ display: 'block', width: '100%' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={isCombo ? handleDisconnectCombo : () => handleDisconnectSingle(platform)}
                  sx={{
                    borderColor: '#ef444450', color: '#ef4444', height: 32, fontSize: '0.75rem',
                    '&:hover': { borderColor: '#ef4444', backgroundColor: '#ef444410' }
                  }}
                >
                  Disconnect
                </Button>
              </span>
            </Tooltip>
          ) : (
            // Connect button
            <Tooltip title={`Connect your ${meta.name} account`}>
              <span style={{ display: 'block', width: '100%' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleConnect}
                  sx={{
                    borderColor: `${color}60`, color,
                    '&:hover': { borderColor: color, backgroundColor: `${color}10` }
                  }}
                >
                  Connect
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlatformCard;
