import { Suspense, lazy } from 'react';
import { Box, Container, Grid, Stack, Typography, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InsightsIcon from '@mui/icons-material/Insights';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShareIcon from '@mui/icons-material/Share';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FloatingChip from './FloatingChip';

// three.js / react-three-fiber is a heavy dependency — load it in its own chunk
// so it never blocks the initial paint of the hero text/CTAs or the dashboard bundle.
const HeroBot3D = lazy(() => import('./HeroBot3D'));

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' } }),
};

const HeroSection = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Box component="section" sx={{ position: 'relative', pt: { xs: 16, md: 20 }, pb: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 4 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={0} variants={fadeUp}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                label="AI-powered social automation"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: 'secondary.main',
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.14), rgba(217,70,239,0.14))',
                  border: '1px solid rgba(217,70,239,0.25)',
                }}
              />
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={1} variants={fadeUp}>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.4rem' }, mb: 2.5 }}>
                Manage, automate & analyze
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    backgroundImage: (t) => t.custom.gradients.text,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  your social media with PostPilot
                </Box>
              </Typography>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={2} variants={fadeUp}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 4, maxWidth: 480, lineHeight: 1.6 }}>
                One AI co-pilot to schedule posts, automate publishing and track performance across every platform — so your content runs itself.
              </Typography>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={3} variants={fadeUp}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                  sx={{ fontSize: '1rem', px: 3.5, py: 1.4 }}
                >
                  Get Started
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  startIcon={<PlayCircleOutlineIcon />}
                  onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ fontSize: '1rem', px: 3.5, py: 1.4, borderColor: 'divider' }}
                >
                  See How It Works
                </Button>
              </Stack>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 380, md: 480 },
                perspective: 1000,
              }}
            >
              <Suspense
                fallback={
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(217,70,239,0.12))',
                    }}
                  />
                }
              >
                <HeroBot3D />
              </Suspense>

              <FloatingChip
                icon={<EventAvailableIcon fontSize="small" />}
                label="Scheduled Post"
                value="Today, 6:00 PM"
                color="#8B5CF6"
                delay={0.2}
                duration={7}
                sx={{ top: '6%', left: '-4%' }}
              />
              <FloatingChip
                icon={<InsightsIcon fontSize="small" />}
                label="Analytics"
                value="+24.5% reach"
                color="#22D3EE"
                delay={0.4}
                duration={6.5}
                sx={{ top: '18%', right: '-6%' }}
              />
              <FloatingChip
                icon={<FavoriteIcon fontSize="small" />}
                label="Engagement"
                value="12.3k this week"
                color="#F472B6"
                delay={0.6}
                duration={8}
                sx={{ bottom: '20%', left: '-8%' }}
              />
              <FloatingChip
                icon={<AutoAwesomeIcon fontSize="small" />}
                label="Automation"
                value="Running 24/7"
                color="#D946EF"
                delay={0.3}
                duration={7.5}
                sx={{ bottom: '6%', right: '2%' }}
              />
              <FloatingChip
                icon={<ShareIcon fontSize="small" />}
                label="Platforms"
                value="6 connected"
                color="#67E8F9"
                delay={0.5}
                duration={6}
                sx={{ top: '46%', left: '38%', display: { xs: 'none', md: 'flex' } }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
