import { Box, Container, Paper, Stack, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CtaSection = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Box component="section" id="about" sx={{ py: { xs: 8, md: 10 } }}>
      <Container maxWidth="md">
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 5,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(217,70,239,0.12) 55%, rgba(34,211,238,0.08))',
            border: '1px solid rgba(217,70,239,0.25)',
          }}
        >
          <Typography variant="h3" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, mb: 1.5 }}>
            PostPilot is your intelligent co-pilot for social media
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 560, mx: 'auto' }}>
            Modern, reliable automation that plans, publishes and analyzes your content — so you can spend your time creating, not managing tabs.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              size="large"
              variant="contained"
              color="primary"
              startIcon={<RocketLaunchIcon />}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              sx={{ px: 4, py: 1.4 }}
            >
              Get Started Free
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default CtaSection;
