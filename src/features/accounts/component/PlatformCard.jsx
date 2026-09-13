import { Box, Card, CardContent, Typography, Chip, Skeleton, Tooltip, Divider, Avatar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useSelector } from 'react-redux';
import { accountsApiAction } from '../accountsApiSlice';
import { appConstants } from '../../../constant/appConstants';
import Button from '../../../common/Button';
import { useTranslation } from '../../../i18n/useTranslation';

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
  twitter: '#1D9BF0',
  whatsapp: '#25D366',
};

const PlatformCard = ({ platform, connectedAccount, isLoading }) => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const [disconnectAccount] = accountsApiAction.disconnectAccount();

  const meta = appConstants.platforms[platform] || { name: platform, isComingSoon: false };
  const isMulti = platform === 'facebook' || platform === 'instagram';
  const accountsList = isMulti ? (Array.isArray(connectedAccount) ? connectedAccount : []) : [];
  const isConnected = isMulti ? accountsList.length > 0 : !!connectedAccount;
  const color = PLATFORM_COLORS[platform] || '#7C3AED';

  const handleConnect = () => {
    const userId = user?.userId || (isMulti
      ? accountsList[0]?.userId
      : connectedAccount?.userId);
    const targetPlatform = isMulti ? 'facebook' : platform;
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
      await disconnectAccount({ platform: targetPlatform }).unwrap();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  // Per-page Facebook disconnect (specific platformAccountId)
  const handleDisconnectFbPage = async (page) => {
    if (!window.confirm(`Disconnect "${page.displayName}" Facebook page?`)) return;
    try {
      await disconnectAccount({ platform: 'facebook', accountId: page.platformAccountId }).unwrap();
    } catch (err) {
      console.error('Failed to disconnect FB page:', err);
    }
  };

  // Per-account Instagram disconnect (specific platformAccountId)
  const handleDisconnectIgAccount = async (account) => {
    if (!window.confirm(`Disconnect "${account.displayName}" Instagram account?`)) return;
    try {
      await disconnectAccount({ platform: 'instagram', accountId: account.platformAccountId }).unwrap();
    } catch (err) {
      console.error('Failed to disconnect IG account:', err);
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

  // Renders each connected item (FB page or IG account) as a separate row
  const renderMultiAccounts = () => {
    if (accountsList.length === 0) return null;
    return (
      <Box sx={{ width: '100%', mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
          {platform === 'facebook'
            ? `Facebook ${t('pages')} (${accountsList.length})`
            : `Instagram ${t('accounts')} (${accountsList.length})`}
        </Typography>
        {accountsList.map((item, idx) => (
          <Box key={item.platformAccountId || idx}>
            {idx > 0 && <Divider sx={{ borderColor: 'divider', my: 0.75 }} />}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {item.profilePictureUrl ? (
                  <Avatar src={item.profilePictureUrl} sx={{ width: 20, height: 20, flexShrink: 0 }} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#4ade80', flexShrink: 0 }} />
                )}
                <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.displayName || (platform === 'facebook' ? 'Facebook Page' : 'Instagram Account')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => (platform === 'facebook' ? handleDisconnectFbPage(item) : handleDisconnectIgAccount(item))}
                sx={{
                  flexShrink: 0,
                  borderColor: '#ef444440',
                  color: '#ef4444',
                  height: 24,
                  fontSize: '0.65rem',
                  px: 1,
                  minWidth: 'unset',
                  '&:hover': { borderColor: '#ef4444', backgroundColor: '#ef444410' },
                }}
              >
                {t('disconnect')}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const topStripBackground = platform === 'instagram'
    ? 'linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
    : color;

  return (
    <Card sx={{
      borderRadius: 3,
      border: isConnected ? `1px solid ${color}40` : (theme) => `1px solid ${theme.palette.divider}`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': meta.isComingSoon ? {} : {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 36px ${color}25`,
      },
      opacity: meta.isComingSoon ? 0.6 : 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Colored top strip when connected */}
      {isConnected && (
        <Box sx={{ height: 3, background: topStripBackground }} />
      )}

      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Coming soon badge */}
        {meta.isComingSoon && (
          <Chip
            label={t('comingSoon')}
            size="small"
            sx={{
              position: 'absolute', top: 12, right: 12,
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              color: 'text.secondary', fontSize: '0.65rem', height: 20,
            }}
          />
        )}

        {/* Icon */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, justifyContent: 'center', color: meta.isComingSoon ? 'text.secondary' : color }}>
          {PLATFORM_ICONS[platform]}
        </Box>

        {/* Platform name */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, textAlign: 'center', color: 'text.primary' }}>
          {meta.name}
        </Typography>

        {/* Status area */}
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          {isMulti ? (
            renderMultiAccounts()
          ) : isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 0.5 }}>
              {connectedAccount?.profilePictureUrl ? (
                <Avatar src={connectedAccount.profilePictureUrl} sx={{ width: 22, height: 22, flexShrink: 0 }} />
              ) : (
                <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />
              )}
              <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {connectedAccount?.displayName || t('connected')}
              </Typography>
            </Box>
          ) : null}
        </Box>

        {/* Action button — bottom */}
        <Box sx={{ mt: 'auto', width: '100%', pt: isConnected && isMulti ? 1 : 0 }}>
          {meta.isComingSoon ? (
            <Box sx={{ py: 1, textAlign: 'center', borderRadius: 1, border: (theme) => `1px dashed ${theme.palette.divider}` }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('comingSoon')}</Typography>
            </Box>
          ) : isMulti ? (
            !isConnected ? (
              <Tooltip title={platform === 'instagram' ? t('connectViaFacebook') : t('connectFacebookAccount')}>
                <span style={{ display: 'block', width: '100%' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleConnect}
                    sx={{ borderColor: `${color}60`, color, '&:hover': { borderColor: color, backgroundColor: `${color}10` } }}
                  >
                    {t('connect')}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Tooltip title={platform === 'instagram' ? t('connectViaFacebook') : t('connectMoreFacebookPages')}>
                <span style={{ display: 'block', width: '100%' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleConnect}
                    sx={{ borderColor: `${color}40`, color, height: 32, fontSize: '0.75rem', '&:hover': { borderColor: color, backgroundColor: `${color}10` } }}
                  >
                    {platform === 'facebook' ? t('addMorePages') : t('addMoreAccounts')}
                  </Button>
                </span>
              </Tooltip>
            )
          ) : isConnected ? (
            <Tooltip title={`${t('disconnect')} ${meta.name}`}>
              <span style={{ display: 'block', width: '100%' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleDisconnectSingle(platform)}
                  sx={{ borderColor: '#ef444450', color: '#ef4444', height: 32, fontSize: '0.75rem', '&:hover': { borderColor: '#ef4444', backgroundColor: '#ef444410' } }}
                >
                  {t('disconnect')}
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title={`${t('connect')} ${meta.name}`}>
              <span style={{ display: 'block', width: '100%' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleConnect}
                  sx={{ borderColor: `${color}60`, color, '&:hover': { borderColor: color, backgroundColor: `${color}10` } }}
                >
                  {t('connect')}
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
