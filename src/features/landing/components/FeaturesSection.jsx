import { Box, Container, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BoltIcon from '@mui/icons-material/Bolt';
import InsightsIcon from '@mui/icons-material/Insights';
import HubIcon from '@mui/icons-material/Hub';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const FEATURES = [
  {
    icon: CalendarMonthIcon,
    title: 'Content Scheduling',
    desc: 'Plan weeks of posts in minutes with a visual calendar built for teams that publish often.',
    color: '#8B5CF6',
  },
  {
    icon: BoltIcon,
    title: 'Social Media Automation',
    desc: 'Set the rules once — PostPilot publishes, reposts and follows up automatically.',
    color: '#D946EF',
  },
  {
    icon: InsightsIcon,
    title: 'Analytics',
    desc: 'Understand reach, engagement and growth with clear, real-time dashboards.',
    color: '#22D3EE',
  },
  {
    icon: HubIcon,
    title: 'Multi-platform Management',
    desc: 'Instagram, YouTube, Facebook and more — manage every account from one place.',
    color: '#F472B6',
  },
  {
    icon: SmartToyIcon,
    title: 'AI-assisted Content',
    desc: 'Generate captions, hashtags and post ideas tailored to your brand voice.',
    color: '#A78BFA',
  },
  {
    icon: TrendingUpIcon,
    title: 'Post Performance',
    desc: 'See what works and double down — with per-post breakdowns across platforms.',
    color: '#67E8F9',
  },
];

const FeatureCard = ({ feature, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const Icon = feature.icon;

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, delay: index * 0.08 }}
        whileHover={{ y: -10, rotateX: 4, rotateY: -3 }}
        elevation={0}
        sx={{
          height: '100%',
          p: 3.5,
          borderRadius: 4,
          transformStyle: 'preserve-3d',
          backdropFilter: 'blur(14px)',
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: `0 20px 40px ${feature.color}22`,
          },
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
            background: `linear-gradient(135deg, ${feature.color}33, ${feature.color}11)`,
            color: feature.color,
          }}
        >
          <Icon />
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {feature.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {feature.desc}
        </Typography>
      </Paper>
    </Grid>
  );
};

const FeaturesSection = () => (
  <Box component="section" id="features" sx={{ py: { xs: 8, md: 12 } }}>
    <Container maxWidth="lg">
      <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}>
          Everything you need
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
          Built for creators & growing teams
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560 }}>
          From scheduling to AI-assisted content, PostPilot handles the busywork so you can focus on the strategy.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </Grid>
    </Container>
  </Box>
);

export default FeaturesSection;
