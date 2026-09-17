import { Box, Container, Typography, Link, IconButton, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';

const getPolicyContent = (path) => {
  switch (path) {
    case '/privacy-policy':
      return {
        title: 'Privacy Policy',
        content: `
          PostPilot is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by PostPilot.
          
          1. Information We Collect
          We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form.
          
          2. How We Use Your Information
          Any of the information we collect from you may be used in one of the following ways:
          - To personalize your experience
          - To improve our website
          - To improve customer service
          - To process transactions
          
          3. Security
          We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
          
          8. Changes to this policy
          We may update this policy occasionally. Any changes will be posted on this page with an updated date at the top.
          
          9. Contact us
          If you have any questions about this Privacy Policy or how your data is handled, contact us at:
          `
      };
    case '/terms-of-service':
      return {
        title: 'Terms of Service',
        content: `
          By using PostPilot, you agree to these terms.
          
          1. Acceptance of Terms
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          
          2. Provision of Services
          You agree and acknowledge that PostPilot is entitled to modify, improve or discontinue any of its services at its sole discretion and without notice to you even if it may result in you being prevented from accessing any information contained in it.
          
          7. Changes to these Terms
          We may update these Terms from time to time. Continued use of the app after changes means you accept the updated Terms.
          
          8. Contact us
          Questions about these Terms can be sent to:
          `
      };
    case '/cookie-policy':
      return {
        title: 'Cookie Policy',
        content: `
          This is the Cookie Policy for PostPilot.
          
          1. What Are Cookies
          As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience.
          
          2. How We Use Cookies
          We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
          
          3. Contact us
          For more information on our cookie policy, please contact us at:
          `
      };
    default:
      return { title: 'Policy', content: '' };
  }
};

const PolicyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const { title, content } = getPolicyContent(location.pathname);
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 10, pb: 10 }}>
      <Container maxWidth="md">
        <IconButton 
          onClick={() => navigate('/')} 
          sx={{ mb: 4, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h3" fontWeight={800} mb={6} sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        
        <Box sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1rem' }}>
          {content}
        </Box>
        
        <Box sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>Email: <Link href="mailto:support@postpilot.com">support@postpilot.com</Link></Typography>
        </Box>
        
        <Box sx={{ mt: 10, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            PostPilot — Social Media Scheduler
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PolicyPage;
