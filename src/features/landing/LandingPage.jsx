import { Box } from '@mui/material';
import AuroraBackground from './components/AuroraBackground';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import PlatformsSection from './components/PlatformsSection';
import FeaturesSection from './components/FeaturesSection';
import DashboardPreview from './components/DashboardPreview';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';
import LandingFooter from './components/LandingFooter';

const LandingPage = () => {
  return (
    <Box sx={{ position: 'relative', overflowX: 'hidden', minHeight: '100vh' }}>
      <AuroraBackground />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <LandingNavbar />
        <HeroSection />
        <PlatformsSection />
        <FeaturesSection />
        <DashboardPreview />
        <TestimonialsSection />
        <CtaSection />
        <LandingFooter />
      </Box>
    </Box>
  );
};

export default LandingPage;
