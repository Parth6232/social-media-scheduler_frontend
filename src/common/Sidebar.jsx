import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Drawer } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LinkIcon from '@mui/icons-material/Link';
import HistoryIcon from '@mui/icons-material/History';
import { styled } from '@mui/material/styles';

import { useTranslation } from '../i18n/useTranslation';

const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  display: 'block',
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
    '& .MuiListItem-root': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.08)',
      borderRight: `3px solid ${theme.palette.primary.main}`,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))' : 'none',
    },
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  margin: '4px 16px',
  width: 'calc(100% - 32px)',
  borderRadius: 8,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
}));

const navItems = [
  { path: '/dashboard', labelKey: 'dashboard', icon: <DashboardIcon /> },
  { path: '/create', labelKey: 'createPost', icon: <AddCircleIcon /> },
  { path: '/accounts', labelKey: 'accounts', icon: <LinkIcon /> },
  { path: '/posts', labelKey: 'postsHistory', icon: <HistoryIcon /> },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { t } = useTranslation();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <LogoBox>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 'bold'
        }}>
          S
        </div>
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
          SocialBlitz
        </Typography>
      </LogoBox>

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navItems.map((item) => (
          <StyledNavLink key={item.path} to={item.path} onClick={() => { if (mobileOpen) handleDrawerToggle(); }}>
            <StyledListItem>
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={t(item.labelKey)} 
                slotProps={{ primary: { fontWeight: 500 } }}
              />
            </StyledListItem>
          </StyledNavLink>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { lg: 260 }, flexShrink: { lg: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 260, 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(10, 15, 30, 0.95)' : theme.palette.background.paper,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 260, 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(10, 15, 30, 0.8)' : theme.palette.background.paper, 
            backdropFilter: (theme) => theme.palette.mode === 'dark' ? 'blur(10px)' : 'none', 
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
