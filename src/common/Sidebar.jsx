import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LinkIcon from '@mui/icons-material/Link';
import HistoryIcon from '@mui/icons-material/History';
import { styled } from '@mui/material/styles';

const DrawerContainer = styled(Box)(({ theme }) => ({
  width: 260,
  flexShrink: 0,
  backgroundColor: 'rgba(10, 15, 30, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'fixed',
}));

const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  '&.active': {
    color: '#fff',
    '& .MuiListItem-root': {
      backgroundColor: 'rgba(124, 58, 237, 0.15)',
      borderRight: `3px solid ${theme.palette.primary.main}`,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))',
    },
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  margin: theme.spacing(0.5, 2),
  width: 'calc(100% - 32px)',
  borderRadius: 8,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
}));

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/create', label: 'Create Post', icon: <AddCircleIcon /> },
  { path: '/accounts', label: 'Accounts', icon: <LinkIcon /> },
  { path: '/posts', label: 'Posts History', icon: <HistoryIcon /> },
];

const Sidebar = () => {
  return (
    <DrawerContainer>
      <LogoBox>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 'bold'
        }}>
          S
        </div>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff' }}>
          SocialBlitz
        </Typography>
      </LogoBox>

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navItems.map((item) => (
          <StyledNavLink key={item.path} to={item.path}>
            <StyledListItem>
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </StyledListItem>
          </StyledNavLink>
        ))}
      </List>
    </DrawerContainer>
  );
};

export default Sidebar;
