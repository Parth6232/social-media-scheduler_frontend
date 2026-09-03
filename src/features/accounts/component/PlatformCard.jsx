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
  const meta = appConstants.platforms[platform];
  const isConnected = !!connectedAccount;
  const color = PLATFORM_COLORS[platform];

  const handleConnect = () => {
    const userId = user?.userId || connectedAccount?.userId;
    const endpointMap = {
      youtube: `${appConstants.apiBaseURL}/auth/youtube/connect?userId=${userId}`,
      facebook: `${appConstants.apiBaseURL}/auth/facebook/connect?userId=${userId}`,
    };
    if (endpointMap[platform]) {
      window.location.href = endpointMap[platform];
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ p: 2, borderRadius: 3 }}>
        <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="80%" height={18} />
        <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 2 }} />
      </Card>
    );
  }

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
    }}>
      {/* Glow top strip when connected */}
      {isConnected && (
        <Box sx={{ height: 3, background: color === '#E1306C' ? 'linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' : color }} />
      )}

      <CardContent sx={{ p: 2.5 }}>
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

        {/* Icon */}
        <Box sx={{ color: meta.isComingSoon ? 'text.secondary' : color, mb: 1.5 }}>
          {PLATFORM_ICONS[platform]}
        </Box>

        {/* Name */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          {meta.name}
        </Typography>

        {/* Status */}
        {isConnected ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />
            <Typography variant="caption" sx={{ color: '#4ade80' }}>
              {connectedAccount.displayName || 'Connected'}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            {meta.isComingSoon ? 'Support coming soon' : 'Not connected'}
          </Typography>
        )}

        {/* Action */}
        {meta.isComingSoon ? (
          <Box sx={{
            py: 1, textAlign: 'center', borderRadius: 1,
            border: '1px dashed rgba(255,255,255,0.1)',
          }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Coming soon</Typography>
          </Box>
        ) : isConnected ? (
          <Box sx={{
            py: 1, textAlign: 'center', borderRadius: 1,
            border: `1px solid ${color}30`, backgroundColor: `${color}10`,
          }}>
            <Typography variant="caption" sx={{ color, fontWeight: 600 }}>✓ Connected</Typography>
          </Box>
        ) : (
          <Tooltip title={`Connect your ${meta.name} account`}>
            <span>
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
      </CardContent>
    </Card>
  );
};

export default PlatformCard;
