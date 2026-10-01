import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Sidebar from '../../common/Sidebar';
import Header from '../../common/Header';
import PlayBackground from '../../common/components/motion/PlayBackground';

const AppLayoutContainer = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Thin aurora progress bar that follows page scroll
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Subtle, low-opacity 3D backdrop that stays fixed behind every app page */}
      <PlayBackground />
      <motion.div
        aria-hidden
        style={{ scaleX, transformOrigin: '0% 50%', position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 1500, background: '#2563EB' }}
      />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <Header handleDrawerToggle={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, overflow: 'auto' }}>
          <AnimatePresence mode="wait" initial={false}>
            <Box
              component={motion.div}
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              sx={{
                // every top-level block of the page rises in one after another
                '& > div > *': { animation: 'pp-rise .55s cubic-bezier(.2,.8,.2,1) both' },
                ...Object.fromEntries([...Array(12)].map((_, i) => [`& > div > *:nth-of-type(${i + 1})`, { animationDelay: `${0.03 + i * 0.05}s` }])),
              }}
            >
              <Outlet />
            </Box>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayoutContainer;
