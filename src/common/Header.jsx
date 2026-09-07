import { Box, IconButton, Avatar, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const displayName = capitalizeName(user?.name || '');
  const initials = getInitials(user?.name || '');

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

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
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      backgroundColor: 'rgba(10, 15, 30, 0.4)',
      backdropFilter: 'blur(10px)',
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

      <Box
        id="header-user-menu-btn"
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1, ml: 'auto' }}
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

        <Typography variant="subtitle2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
          {displayName || 'User'}
        </Typography>
        <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      </Box>

      <Menu
        id="header-user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: 160,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>{displayName}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', mt: 0.5 }}>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Header;
