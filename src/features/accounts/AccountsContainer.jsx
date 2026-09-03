import { Box, Grid, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { accountsApiAction } from './accountsApiSlice';
import PlatformCard from './component/PlatformCard';

const PLATFORMS = ['youtube', 'facebook', 'instagram', 'linkedin', 'twitter', 'whatsapp'];

const AccountsContainer = () => {
  const { data: accounts, isLoading } = accountsApiAction.getMyAccounts();

  const getConnectedAccount = (platform) => {
    if (!accounts) return null;
    return accounts.find((a) => a.platform === platform) || null;
  };

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
          <Typography variant="h5" fontWeight={700}>Connected Accounts</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 7 }}>
          Connect your social media accounts to start scheduling posts
        </Typography>
      </Box>

      {/* Stats banner */}
      {!isLoading && accounts && (
        <Box sx={{
          mb: 4, p: 2, borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(37, 99, 235, 0.1))',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ color: '#A78BFA', fontWeight: 700, fontSize: '1.1rem' }}>
              {accounts.length}
            </Box>
            {' '}of {PLATFORMS.filter(p => !['linkedin', 'twitter', 'whatsapp'].includes(p)).length} available platforms connected
          </Typography>
        </Box>
      )}

      {/* Platform Grid */}
      <Grid container spacing={2.5}>
        {PLATFORMS.map((platform) => (
          <Grid item xs={12} sm={6} md={4} key={platform}>
            <PlatformCard
              platform={platform}
              connectedAccount={getConnectedAccount(platform)}
              isLoading={isLoading}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AccountsContainer;
