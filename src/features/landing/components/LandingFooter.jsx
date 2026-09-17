import { Box, Container, Grid, Stack, Typography, IconButton, Link, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { motion } from 'framer-motion';
import logoFull from '../../../assets/brand/postpilot-logo-full.png';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', isHash: true },
      { label: 'How it Works', isHash: true },
      { label: 'About', isHash: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Terms of Service', path: '/terms-of-service' },
      { label: 'Cookie Policy', path: '/cookie-policy' },
    ],
  },
];

const LandingFooter = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        py: { xs: 8, md: 10 },
        background: isDark 
          ? 'linear-gradient(180deg, rgba(10, 8, 20, 0) 0%, rgba(10, 8, 20, 0.8) 100%)' 
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 250, 252, 1) 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} justifyContent="space-between">
          <Grid item xs={12} md={5}>
            <Box component="img" src={logoFull} alt="PostPilot logo" sx={{ height: 36, mb: 3 }} />
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 320, lineHeight: 1.6, mb: 4 }}>
              Intelligent, modern, reliable social media automation for creators and forward-thinking teams.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {[XIcon, InstagramIcon, LinkedInIcon].map((Icon, i) => (
                <IconButton
                  key={i}
                  component={motion.button}
                  whileHover={{ scale: 1.15, y: -4, color: theme.palette.primary.main }}
                  whileTap={{ scale: 0.95 }}
                  sx={{ 
                    color: 'text.secondary',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.1)' }
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Grid container spacing={4} justifyContent="flex-end">
              {COLUMNS.map((col) => (
                <Grid item xs={6} sm={5} key={col.title}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                    {col.title}
                  </Typography>
                  <Stack spacing={2}>
                    {col.links.map((link) => {
                      const linkProps = link.isHash 
                        ? { href: `#${link.label.toLowerCase().replace(/\s+/g, '-')}` }
                        : { component: RouterLink, to: link.path };
                      
                      return (
                        <Link
                          key={link.label}
                          component={link.isHash ? motion.a : motion(RouterLink)}
                          whileHover={{ x: 6, color: theme.palette.primary.main }}
                          underline="none"
                          variant="body2"
                          sx={{ 
                            color: 'text.secondary', 
                            cursor: 'pointer',
                            display: 'inline-block',
                            width: 'fit-content'
                          }}
                          {...linkProps}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ 
          mt: 8, 
          pt: 4, 
          borderTop: '1px solid', 
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © {new Date().getFullYear()} PostPilot. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
