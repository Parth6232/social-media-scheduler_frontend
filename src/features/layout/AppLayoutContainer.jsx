import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../../common/Sidebar';
import Header from '../../common/Header';

const AppLayoutContainer = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header handleDrawerToggle={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayoutContainer;
