import { useRef } from 'react';
import { Box, Container, Grid, Paper, Stack, Typography, useTheme, Avatar, AvatarGroup, LinearProgress } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BoltIcon from '@mui/icons-material/Bolt';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const bars = [40, 65, 50, 80, 60, 95, 72];

const DashboardPreview = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 });

  const handleMouseMove = (e) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <Box component="section" id="how-it-works" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}>
            See it in action
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            A control room for every post you publish
          </Typography>
        </Stack>

        <Box sx={{ perspective: 1600 }}>
          <Box
            ref={ref}
            component={motion.div}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3.5 },
                borderRadius: 5,
                backdropFilter: 'blur(20px)',
                backgroundColor: isDark ? 'rgba(18, 14, 34, 0.6)' : 'rgba(255,255,255,0.85)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.5)' : '0 30px 80px rgba(139,92,246,0.16)',
              }}
            >
              <Grid container spacing={2.5}>
                {/* Top bar */}
                <Grid item xs={12}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Automation active
                      </Typography>
                    </Stack>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}>
                      <Avatar sx={{ bgcolor: '#8B5CF6' }}><InstagramIcon sx={{ fontSize: 16 }} /></Avatar>
                      <Avatar sx={{ bgcolor: '#D946EF' }}><YouTubeIcon sx={{ fontSize: 16 }} /></Avatar>
                      <Avatar sx={{ bgcolor: '#22D3EE' }}><FacebookIcon sx={{ fontSize: 16 }} /></Avatar>
                    </AvatarGroup>
                  </Stack>
                </Grid>

                {/* Analytics chart */}
                <Grid item xs={12} md={7}>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(139,92,246,0.05)', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Engagement this week</Typography>
                      <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 700 }}>+18.2%</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.2} alignItems="flex-end" sx={{ height: 110 }}>
                      {bars.map((h, i) => (
                        <Box
                          key={i}
                          component={motion.div}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: i * 0.06 }}
                          sx={{
                            flex: 1,
                            borderRadius: 1.5,
                            background: 'linear-gradient(180deg, #D946EF, #8B5CF6)',
                            opacity: 0.85,
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Scheduling + notifications */}
                <Grid item xs={12} md={5}>
                  <Stack spacing={2} sx={{ height: '100%' }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)' }}>
                      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
                        <CalendarMonthIcon fontSize="small" sx={{ color: '#8B5CF6' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Next scheduled</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        “Product launch reel” — Instagram, 6:00 PM today
                      </Typography>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)' }}>
                      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
                        <BoltIcon fontSize="small" sx={{ color: '#D946EF' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Automation status</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={82}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #22D3EE, #D946EF)' },
                        }}
                      />
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', flexGrow: 1 }}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <NotificationsActiveIcon fontSize="small" sx={{ color: '#22D3EE' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>3 new notifications</Typography>
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPreview;
