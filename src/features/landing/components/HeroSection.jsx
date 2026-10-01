import { useEffect, useState } from 'react';
import { Box, Container, Grid, Stack, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const EASE = [0.2, 0.8, 0.2, 1];
const CAPTION = 'Spring collection drops Friday. Early access for subscribers, 6 PM sharp.';
const PLATFORMS = [
  { name: 'YouTube', Icon: YouTubeIcon, color: '#FF0033' },
  { name: 'Facebook', Icon: FacebookIcon, color: '#1877F2' },
  { name: 'Instagram', Icon: InstagramIcon, color: '#E1306C' },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BASE_POSTS = { 0: 1, 2: 2, 3: 1, 5: 1 };

/** Looping product demo: write → pick platforms → pick time → schedule → post lands on the calendar. */
const ComposerDemo = () => {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(reduced ? 5 : 0);

  useEffect(() => {
    if (reduced) return undefined;
    const delays = [900, 1700, 1100, 1100, 1000, 3200]; // time spent on each step before moving on
    const id = setTimeout(() => setStep((s) => (s + 1) % 6), delays[step]);
    return () => clearTimeout(id);
  }, [step, reduced]);

  const typed = step === 0 ? '' : CAPTION;
  const picked = () => step >= 2;
  const done = step === 5;

  return (
    <Box sx={{ width: '100%', maxWidth: 480, ml: { md: 'auto' }, borderRadius: '18px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
      boxShadow: (t) => (t.palette.mode === 'dark' ? '0 24px 60px rgba(0,0,0,0.5)' : '0 24px 60px rgba(16,24,40,0.10)'), overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontWeight: 600 }}>New post</Typography>
        <Box sx={{ px: 1.25, py: 0.25, borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, bgcolor: done ? 'rgba(18,183,106,0.12)' : 'action.hover', color: done ? 'success.main' : 'text.secondary', transition: 'all .3s' }}>
          {done ? 'Scheduled' : 'Draft'}
        </Box>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Box sx={{ minHeight: 78, p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: step === 1 ? 'primary.main' : 'divider', fontSize: '0.92rem', lineHeight: 1.55,
          boxShadow: step === 1 ? '0 0 0 3px rgba(37,99,235,0.14)' : 'none', transition: 'all .25s' }}>
          {typed ? (
            <Box component={motion.span} key={typed} initial={reduced ? false : { clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 1.5, ease: 'linear' }} sx={{ display: 'block' }}>
              {typed}
            </Box>
          ) : <Box sx={{ color: 'text.secondary' }}>Write something…<Box component="span" sx={{ display: 'inline-block', width: 1.5, height: 15, bgcolor: 'primary.main', ml: 0.25, verticalAlign: 'middle', animation: 'pp-blink 1s steps(1) infinite' }} /></Box>}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mr: 0.5 }}>Post to</Typography>
          {PLATFORMS.map((p, i) => (
            <Box key={p.name} component={motion.div} animate={{ scale: picked(i) ? 1 : 0.94 }} transition={{ duration: 0.3, delay: i * 0.12, ease: EASE }}
              sx={{ position: 'relative', width: 34, height: 34, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: picked(i) ? '#fff' : 'text.secondary', bgcolor: picked(i) ? p.color : 'action.hover', transition: 'background-color .3s .1s, color .3s .1s' }}>
              <p.Icon sx={{ fontSize: 19 }} />
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, minHeight: 32 }}>
          <AnimatePresence>
            {step >= 3 && (
              <Box component={motion.div} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: '8px', border: '1px solid', borderColor: 'divider', fontSize: '0.85rem', fontWeight: 500 }}>
                <ScheduleIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Fri, 6:00 PM
                <Box component="span" sx={{ ml: 0.5, px: 0.75, borderRadius: 99, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main' }}>Best time</Box>
              </Box>
            )}
          </AnimatePresence>
        </Box>

        <Box component={motion.div} animate={{ scale: step === 4 ? 0.97 : 1 }} transition={{ duration: 0.15 }}
          sx={{ mt: 2, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, fontWeight: 600, fontSize: '0.92rem',
            color: '#fff', bgcolor: done ? 'success.main' : 'primary.main', transition: 'background-color .3s' }}>
          {done ? <><CheckIcon sx={{ fontSize: 18 }} /> Scheduled for Friday</> : 'Schedule post'}
        </Box>
      </Box>

      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FAFBFC') }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75 }}>
          {DAYS.map((d, i) => {
            const n = (BASE_POSTS[i] || 0) + (i === 4 && done ? 1 : 0);
            const isNew = i === 4 && done;
            return (
              <Box key={d} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{d}</Typography>
                <Box sx={{ mt: 0.5, height: 44, borderRadius: '8px', border: '1px solid', borderColor: isNew ? 'primary.main' : 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.4, transition: 'border-color .3s' }}>
                  {[...Array(n)].map((_, k) => (
                    <Box key={k} component={motion.span} initial={isNew && k === n - 1 && !reduced ? { scale: 0, y: -14 } : false} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                      sx={{ width: 22, height: 5, borderRadius: 3, bgcolor: isNew && k === n - 1 ? 'primary.main' : 'action.selected' }} />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Box component="section" sx={{ position: 'relative', pt: { xs: 14, md: 19 }, pb: { xs: 9, md: 13 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 7, md: 6 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component={motion.div} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, mb: 3, borderRadius: 99, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', fontSize: '0.85rem', fontWeight: 500, color: 'text.secondary' }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} /> Now scheduling to YouTube, Facebook and Instagram
              </Box>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', sm: '3rem', md: '3.6rem' }, mb: 2.5, maxWidth: 560 }}>
                Plan once. Post everywhere.
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: { xs: '1.02rem', md: '1.15rem' }, lineHeight: 1.6, mb: 4, maxWidth: 480 }}>
                PostPilot schedules your posts across every platform, picks the best time to publish, and shows what is working, all from one dashboard.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button size="large" variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}>
                  Get started free
                </Button>
                <Button size="large" variant="outlined" onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                  See how it works
                </Button>
              </Stack>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component={motion.div} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}>
              <ComposerDemo />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
