import { Box, Container, Grid, Paper, Stack, Typography, Avatar, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const TESTIMONIALS = [
  {
    quote: 'PostPilot cut our content ops time in half. Scheduling across five platforms used to eat our whole morning — now it runs itself.',
    name: 'Ananya Rao',
    role: 'Founder, StudioBloom',
    color: '#8B5CF6',
  },
  {
    quote: 'The analytics finally make sense. We know exactly which posts to double down on instead of guessing.',
    name: 'Karan Mehta',
    role: 'Growth Lead, Nimbus Labs',
    color: '#D946EF',
  },
  {
    quote: 'Automation rules + AI captions is a genuinely great combo. It feels like having a social media manager on call 24/7.',
    name: 'Sara Fernandes',
    role: 'Creator, 240k followers',
    color: '#22D3EE',
  },
];

const TestimonialsSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}>
            Loved by creators & teams
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Don't just take our word for it
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {TESTIMONIALS.map((t, i) => (
            <Grid item xs={12} md={4} key={t.name}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 40, rotateX: -8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -8 }}
                elevation={0}
                sx={{
                  height: '100%',
                  p: 3.5,
                  borderRadius: 4,
                  transformStyle: 'preserve-3d',
                  backdropFilter: 'blur(14px)',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: isDark ? '0 20px 45px rgba(0,0,0,0.35)' : '0 20px 45px rgba(139,92,246,0.1)',
                }}
              >
                <FormatQuoteIcon sx={{ fontSize: 32, color: t.color, opacity: 0.6, mb: 1 }} />
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  {t.quote}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: t.color, fontWeight: 700 }}>{t.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t.role}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
