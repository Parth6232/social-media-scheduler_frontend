import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Box, Stack, Button, IconButton, useTheme, useMediaQuery, Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toggleThemeMode } from '../../../store/redux/slices/uiSlice';
import logoFull from '../../../assets/brand/postpilot-logo-full.png';
import logoIcon from '../../../assets/brand/postpilot-icon.png';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
];

const scrollToId = (id) => {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const LandingNavbar = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled
            ? isDark
              ? 'rgba(10, 8, 20, 0.65)'
              : 'rgba(255, 255, 255, 0.7)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` : '1px solid transparent',
          transition: 'background-color 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', py: 1 }}>
          <Box
            component="img"
            src={isMobile ? logoIcon : logoFull}
            alt="PostPilot logo"
            sx={{ height: 32, cursor: 'pointer', mr: 2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.href}
                onClick={() => scrollToId(link.href)}
                sx={{ color: 'text.primary', fontWeight: 500, opacity: 0.85, '&:hover': { opacity: 1, background: 'transparent' } }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              aria-label="Toggle color theme"
              onClick={() => dispatch(toggleThemeMode())}
              sx={{ color: 'text.primary' }}
            >
              {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              <Button variant="text" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')} sx={{ color: 'text.primary', fontWeight: 600 }}>
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </Button>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                variant="contained"
                color="primary"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                sx={{ fontWeight: 700 }}
              >
                Get Started
              </Button>
            </Box>

            <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }} onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }} role="navigation">
          <Box sx={{ px: 2, pb: 2 }}>
            <Box component="img" src={logoFull} alt="PostPilot logo" sx={{ height: 28 }} />
          </Box>
          <List>
            {NAV_LINKS.map((link) => (
              <ListItemButton
                key={link.href}
                onClick={() => {
                  setDrawerOpen(false);
                  scrollToId(link.href);
                }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            <ListItemButton onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
              <ListItemText primary={isAuthenticated ? 'Dashboard' : 'Login'} />
            </ListItemButton>
          </List>
          <Box sx={{ px: 2, mt: 1 }}>
            <Button fullWidth variant="contained" color="primary" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}>
              Get Started
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default LandingNavbar;
