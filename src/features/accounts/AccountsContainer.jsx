import { Box, Grid, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { accountsApiAction } from './accountsApiSlice';
import PlatformCard from './component/PlatformCard';
import { useTranslation } from '../../i18n/useTranslation';
import AnimatedSection from '../../common/components/motion/AnimatedSection';
import PageHeader from '../../common/components/motion/PageHeader';
import Counter from '../../common/components/motion/Counter';
// NEW: email notification settings
import NotificationSettingsCard from './component/NotificationSettingsCard';

const PLATFORMS = ['youtube', 'facebook', 'instagram', 'linkedin'];

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
      <PageHeader
        icon={<LinkIcon />}
        title={t('connectedAccounts')}
        subtitle={t('connectedAccountsSubtitle')}
      />

      {/* NEW: Email notification settings card — between header and stats banner */}
      <AnimatedSection delay={0.05} sx={{ mb: 1 }}>
        <NotificationSettingsCard />
      </AnimatedSection>

      {/* Stats banner */}
      {!isLoading && accounts && (
        <AnimatedSection delay={0.1}>
        <Box sx={{
          mb: 4, p: 2, borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(37,99,235, 0.1)'
            : 'rgba(37,99,235, 0.1)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(37,99,235, 0.25)' : 'rgba(37,99,235, 0.15)',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.1rem' }}>
              <Counter value={uniqueConnectedPlatforms} duration={1.2} />
            </Box>
            {' '}{t('of')} 3 {t('availablePlatformsConnected')}
          </Typography>
        </Box>
        </AnimatedSection>
      )}

      {/* Platform Grid */}
      <Grid container spacing={2.5}>
        {PLATFORMS.map((platform, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={platform} sx={{ display: 'flex' }}>
            <AnimatedSection delay={0.1 * index} sx={{ width: '100%', height: '100%' }}>
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
            </AnimatedSection>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AccountsContainer;
