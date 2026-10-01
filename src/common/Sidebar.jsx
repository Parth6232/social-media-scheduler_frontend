import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Drawer } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LinkIcon from '@mui/icons-material/Link';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
// NEW: Analytics
import InsightsIcon from '@mui/icons-material/Insights';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

import { useTranslation } from '../i18n/useTranslation';
import postPilotIcon from '../assets/brand/postpilot-icon-256.png';
import { StaggerContainer, StaggerItem } from './components/motion/Stagger';

const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 2.5, 1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  display: 'block',
  '&.active': {
    color: theme.palette.primary.main,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  margin: '2px 12px',
  width: 'calc(100% - 24px)',
  borderRadius: 8,
  padding: '7px 10px',
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
  // NEW: Analytics
  { path: '/analytics', labelKey: 'analytics', icon: <InsightsIcon /> },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const drawerContent = (
    <Box 
      component={motion.div}
      initial={false}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <LogoBox>
        <Box sx={{ width: 34, height: 34, flexShrink: 0, borderRadius: '9px', bgcolor: '#fff', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5 }}>
          <Box component="img" src={postPilotIcon} alt="PostPilot" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>PostPilot</Typography>
      </LogoBox>

      <StaggerContainer initial={false} sx={{ flexGrow: 1, pt: 2 }}>
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
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 8,
                        backgroundColor: 'rgba(37,99,235,0.1)',
                        boxShadow: 'inset 2px 0 0 #2563EB',
                        zIndex: 0,
                      }}
                    />
                  )}
                  <ListItemIcon
                    component={motion.div}
                    whileHover={{ scale: 1.12 }}
                    style={{ perspective: 400, position: 'relative', zIndex: 1 }}
                    sx={{ minWidth: 36, color: 'inherit', display: 'flex', '& svg': { fontSize: 20 } }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={t(item.labelKey)}
                    slotProps={{ primary: { fontWeight: isActive ? 600 : 500, fontSize: '0.9rem', sx: { position: 'relative', zIndex: 1, color: 'inherit' } } }}
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
            backgroundColor: 'background.paper',
            borderRight: '1px solid', borderColor: 'divider',
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
            backgroundColor: 'background.paper',
            borderRight: '1px solid', borderColor: 'divider',
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
