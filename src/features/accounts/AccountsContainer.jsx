import { Box, Grid, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { accountsApiAction } from './accountsApiSlice';
import PlatformCard from './component/PlatformCard';
import { useTranslation } from '../../i18n/useTranslation';

const PLATFORMS = ['youtube', 'facebook', 'instagram', 'linkedin', 'twitter', 'whatsapp'];

const AccountsContainer = () => {
  const { t } = useTranslation();
  const { data: accounts, isLoading } = accountsApiAction.getMyAccounts();

  // Single-account platforms (YouTube, etc.) — sirf pehla match return karo
  const getConnectedAccount = (platform) => {
    if (!accounts) return null;
    return accounts.find((a) => a.platform === platform) || null;
  };

  // Facebook — multiple pages ho sakte hain, isliye array return karo
  const getFacebookPages = () => {
    if (!accounts) return [];
    return accounts.filter((a) => a.platform === 'facebook');
  };

  // Instagram — multiple IG business accounts ho sakte hain (har FB page ka apna IG)
  const getInstagramAccounts = () => {
    if (!accounts) return [];
    return accounts.filter((a) => a.platform === 'instagram');
  };

  // Unique connected platforms count (multiple FB pages = 1 platform)
  const uniqueConnectedPlatforms = accounts
    ? [...new Set(accounts.map((a) => a.platform))].length
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LinkIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>{t('connectedAccounts')}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 7 }}>
          {t('connectedAccountsSubtitle')}
        </Typography>
      </Box>

      {/* Stats banner */}
      {!isLoading && accounts && (
        <Box sx={{
          mb: 4, p: 2, borderRadius: 2,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(37, 99, 235, 0.1))'
            : 'linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(37, 99, 235, 0.06))',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.25)' : 'rgba(124, 58, 237, 0.15)',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.1rem' }}>
              {uniqueConnectedPlatforms}
            </Box>
            {' '}{t('of')} 3 {t('availablePlatformsConnected')}
          </Typography>
        </Box>
      )}

      {/* Platform Grid */}
      <Grid container spacing={2.5}>
        {PLATFORMS.map((platform) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={platform}>
            <PlatformCard
              platform={platform}
              connectedAccount={
                platform === 'facebook'
                  ? getFacebookPages()
                  : platform === 'instagram'
                  ? getInstagramAccounts()
                  : getConnectedAccount(platform)
              }
              isLoading={isLoading}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AccountsContainer;
