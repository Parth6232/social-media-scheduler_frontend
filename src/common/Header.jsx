import { Box, IconButton, Avatar, Menu, MenuItem, Typography, Divider, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/redux/slices/authSlice';
import { toggleThemeMode, setLanguage } from '../store/redux/slices/uiSlice';
import { useTranslation } from '../i18n/useTranslation';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CheckIcon from '@mui/icons-material/Check';

/** Capitalize the first letter of each word */
const capitalizeName = (name = '') =>
  name
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

/** Get initials (up to 2 chars) from a name string */
const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Header = ({ handleDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const themeMode = useSelector((state) => state.ui?.themeMode || 'dark');
  const { t, lang } = useTranslation();

  const displayName = capitalizeName(user?.name || '');
  const initials = getInitials(user?.name || '');

  // User profile menu handlers
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Settings menu handlers
  const handleSettingsOpen = (event) => setSettingsAnchor(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchor(null);

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{
      height: 70,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: { xs: 2, sm: 4 },
      borderBottom: '1px solid',
      borderColor: 'divider',
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(10, 15, 30, 0.7)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
    }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { lg: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

      {/* Right side controls: Settings + User Avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
        {/* Settings Icon Button */}
        <Tooltip title={t('settings')}>
          <IconButton
            id="header-settings-btn"
            color="inherit"
            onClick={handleSettingsOpen}
            sx={{
              color: 'text.primary',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 1,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                transform: 'rotate(25deg)',
              },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Existing User Profile trigger */}
        <Box
          id="header-user-menu-btn"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1 }}
          onClick={handleMenu}
        >
          <Avatar
            src={user?.avatarUrl || undefined}
            alt={displayName}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.9rem',
              fontWeight: 700,
              background: user?.avatarUrl ? undefined : 'linear-gradient(135deg, #7C3AED, #2563EB)',
            }}
          >
            {!user?.avatarUrl && initials}
          </Avatar>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
            {displayName || 'User'}
          </Typography>
          <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </Box>
      </Box>

      {/* Settings Menu */}
      <Menu
        id="header-settings-menu"
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleSettingsClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            minWidth: 220,
            p: 0.5,
            borderRadius: 2,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('settings')}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        {/* Theme Row */}
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {themeMode === 'dark' ? (
              <DarkModeIcon fontSize="small" sx={{ color: 'primary.light' }} />
            ) : (
              <LightModeIcon fontSize="small" sx={{ color: '#F59E0B' }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t('theme')}
            </Typography>
          </Box>
          <Box
            onClick={() => dispatch(toggleThemeMode())}
            sx={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.2,
              py: 0.4,
              borderRadius: 1.5,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'primary.main',
                color: '#fff',
              },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {themeMode === 'dark' ? t('dark') : t('light')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        {/* Language Section */}
        <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('language')}
          </Typography>
        </Box>

        {[
          { code: 'en', label: 'English' },
          { code: 'hi', label: 'हिंदी' },
          { code: 'hinglish', label: 'Hinglish' },
        ].map((item) => {
          const isSelected = lang === item.code;
          return (
            <MenuItem
              key={item.code}
              onClick={() => {
                dispatch(setLanguage(item.code));
              }}
              sx={{
                py: 0.8,
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 1,
                mx: 0.5,
                bgcolor: isSelected
                  ? (theme) => theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.18)' : 'rgba(124, 58, 237, 0.08)'
                  : 'transparent',
                color: isSelected ? 'primary.main' : 'text.primary',
                fontWeight: isSelected ? 600 : 400,
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                {item.label}
              </Typography>
              {isSelected && <CheckIcon fontSize="small" color="primary" />}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Existing User Profile Menu */}
      <Menu
        id="header-user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.08)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary' }}>{displayName}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
          </Box>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', my: 0.5, borderRadius: 1, mx: 0.5 }}>
          {t('logout')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Header;