import { useState } from 'react';
import { Box, Container, Grid, Paper, Stack, Typography, Button, Switch, Chip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    name: 'Starter',
    monthly: 0,
    yearly: 0,
    tagline: 'For creators just getting started',
    features: ['2 connected platforms', 'Basic scheduling', 'Core analytics', 'Community support'],
    highlighted: false,
  },
  {
    name: 'Pro',
    monthly: 19,
    yearly: 15,
    tagline: 'For creators & small teams that post often',
    features: ['All platforms connected', 'AI-assisted content', 'Advanced analytics', 'Automation rules', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Business',
    monthly: 49,
    yearly: 39,
    tagline: 'For agencies managing multiple brands',
    features: ['Everything in Pro', 'Unlimited team seats', 'Multi-brand workspaces', 'Dedicated onboarding'],
    highlighted: false,
  },
];

const PricingSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [yearly, setYearly] = useState(false);
  const navigate = useNavigate();

  return (
    <Box component="section" id="pricing" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 5 }}>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}>
            Simple pricing
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Plans that grow with you
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: yearly ? 400 : 700 }}>Monthly</Typography>
            <Switch checked={yearly} onChange={(e) => setYearly(e.target.checked)} color="secondary" />
            <Typography variant="body2" sx={{ fontWeight: yearly ? 700 : 400 }}>Yearly</Typography>
            <Chip size="small" label="Save 20%" sx={{ background: 'linear-gradient(90deg,#22D3EE,#D946EF)', color: '#fff', fontWeight: 700 }} />
          </Stack>
        </Stack>

        <Grid container spacing={3} alignItems="stretch">
          {PLANS.map((plan, i) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                elevation={0}
                sx={{
                  position: 'relative',
                  height: '100%',
                  p: 4,
                  borderRadius: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  backdropFilter: 'blur(18px)',
                  backgroundColor: plan.highlighted
                    ? isDark
                      ? 'rgba(139,92,246,0.12)'
                      : 'rgba(139,92,246,0.07)'
                    : isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,255,255,0.8)',
                  border: plan.highlighted ? '1px solid rgba(217,70,239,0.4)' : '1px solid',
                  borderColor: plan.highlighted ? 'rgba(217,70,239,0.4)' : 'divider',
                  boxShadow: plan.highlighted ? '0 25px 60px rgba(139,92,246,0.25)' : 'none',
                }}
              >
                {plan.highlighted && (
                  <Chip
                    label="Most Popular"
                    size="small"
                    sx={{ position: 'absolute', top: -14, left: 24, background: 'linear-gradient(90deg,#8B5CF6,#D946EF)', color: '#fff', fontWeight: 700 }}
                  />
                )}
                <Typography variant="h5" sx={{ mb: 0.5 }}>{plan.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>{plan.tagline}</Typography>

                <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 3 }}>
                  <Typography variant="h3">${yearly ? plan.yearly : plan.monthly}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>/ month</Typography>
                </Stack>

                <Stack spacing={1.5} sx={{ mb: 4, flexGrow: 1 }}>
                  {plan.features.map((f) => (
                    <Stack direction="row" spacing={1.2} alignItems="center" key={f}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: plan.highlighted ? '#D946EF' : '#22D3EE' }} />
                      <Typography variant="body2">{f}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant={plan.highlighted ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => navigate('/signup')}
                  sx={{ fontWeight: 700 }}
                >
                  {plan.monthly === 0 ? 'Start for Free' : 'Choose Plan'}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PricingSection;
