import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Drawer } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LinkIcon from '@mui/icons-material/Link';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

import { useTranslation } from '../i18n/useTranslation';
import postPilotIcon from '../assets/brand/postpilot-icon-256.png';
import { StaggerContainer, StaggerItem } from './components/motion/Stagger';

const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  display: 'block',
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))' : 'none',
    },
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  margin: '4px 16px',
  width: 'calc(100% - 32px)',
  borderRadius: 10,
  position: 'relative',
  overflow: 'hidden',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
}));

const navItems = [
  { path: '/', labelKey: 'homePage', icon: <HomeIcon /> },
  { path: '/dashboard', labelKey: 'dashboard', icon: <DashboardIcon /> },
  { path: '/create', labelKey: 'createPost', icon: <AddCircleIcon /> },
  { path: '/accounts', labelKey: 'accounts', icon: <LinkIcon /> },
  { path: '/posts', labelKey: 'postsHistory', icon: <HistoryIcon /> },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const drawerContent = (
    <Box 
      component={motion.div}
      initial={{ x: -100, rotateY: -45, opacity: 0 }}
      animate={{ x: 0, rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
      style={{ transformOrigin: 'left', perspective: 1200 }}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <LogoBox>
        <motion.div
          whileHover={{ rotateY: 18, scale: 1.08 }}
          animate={{ y: [0, -3, 0] }}
          transition={{
            y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
            default: { duration: 0.35 },
          }}
          style={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 22px rgba(124, 58, 237, 0.45), 0 4px 10px rgba(0, 0, 0, 0.3)',
            padding: 6,
            perspective: 600,
          }}
        >
          <Box component="img" src={postPilotIcon} alt="PostPilot" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </motion.div>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #A78BFA 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.01em',
          }}
        >
          PostPilot
        </Typography>
      </LogoBox>

      <StaggerContainer sx={{ flexGrow: 1, pt: 2 }}>
        <List disablePadding>
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
            
          return (
            <StaggerItem key={item.path}>
              <StyledNavLink to={item.path} onClick={() => { if (mobileOpen) handleDrawerToggle(); }}>
                <StyledListItem
                  component={motion.div}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 10,
                        background: 'linear-gradient(120deg, rgba(124,58,237,0.28), rgba(37,99,235,0.16))',
                        border: '1px solid rgba(124, 58, 237, 0.45)',
                        boxShadow: '0 4px 18px rgba(124, 58, 237, 0.25)',
                        zIndex: 0,
                      }}
                    />
                  )}
                  <ListItemIcon
                    component={motion.div}
                    whileHover={{ rotateY: 20, scale: 1.18 }}
                    style={{ perspective: 400, position: 'relative', zIndex: 1 }}
                    sx={{ minWidth: 40, color: 'inherit', display: 'flex' }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={t(item.labelKey)}
                    slotProps={{ primary: { fontWeight: 500, sx: { position: 'relative', zIndex: 1 } } }}
                  />
                </StyledListItem>
              </StyledNavLink>
            </StaggerItem>
          );
        })}
        </List>
      </StaggerContainer>
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
            background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(15, 20, 40, 0.95) 0%, rgba(5, 10, 20, 0.98) 100%)' : theme.palette.background.paper,
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
            background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(15, 20, 40, 0.85) 0%, rgba(5, 10, 20, 0.95) 100%)' : theme.palette.background.paper,
            backdropFilter: 'blur(20px)',
            borderRight: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : theme.palette.divider}`,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
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
