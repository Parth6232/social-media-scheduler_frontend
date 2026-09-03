import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../common/Sidebar';
import Header from '../../common/Header';

const AppLayoutContainer = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: '260px', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayoutContainer;
