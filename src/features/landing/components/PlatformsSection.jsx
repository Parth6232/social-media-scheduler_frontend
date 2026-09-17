import { Box, Container, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { appConstants } from '../../../constant/appConstants';

const ICONS = {
  YouTube: YouTubeIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
  X: XIcon,
  WhatsApp: WhatsAppIcon,
};

const PlatformsSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const platforms = Object.values(appConstants.platforms);

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}>
            Everywhere your audience is
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            One dashboard, every platform
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {platforms.map((platform, i) => {
            const Icon = ICONS[platform.iconName] || ShareIconFallback;
            const gradient = platform.color?.startsWith('linear-gradient') ? platform.color : `linear-gradient(135deg, ${platform.color}, ${platform.color}99)`;
            return (
              <Grid item xs={6} sm={4} md={2} key={platform.name}>
                <Paper
                  component={motion.div}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  whileHover={{ y: -8, rotateX: 6, scale: 1.03 }}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    textAlign: 'center',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    backdropFilter: 'blur(14px)',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      mx: 'auto',
                      mb: 1.5,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: gradient,
                      color: '#fff',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {platform.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: platform.isComingSoon ? 'text.secondary' : '#22c55e', fontWeight: 600 }}>
                    {platform.isComingSoon ? 'Coming soon' : 'Connected'}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

const ShareIconFallback = () => null;

export default PlatformsSection;
