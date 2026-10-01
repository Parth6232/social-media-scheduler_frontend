import { Box, Container, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import CheckIcon from '@mui/icons-material/Check';
import { appConstants } from '../../../constant/appConstants';

const ICONS = { YouTube: YouTubeIcon, Facebook: FacebookIcon, Instagram: InstagramIcon, LinkedIn: LinkedInIcon, X: XIcon };
const EASE = [0.2, 0.8, 0.2, 1];
const solidOf = (c = '#2563EB') => (String(c).match(/#[0-9a-f]{6}|#[0-9a-f]{3}/i) || ['#2563EB'])[0];

const PlatformCard = ({ platform }) => {
  const Icon = ICONS[platform.iconName];
  const solid = solidOf(platform.color);
  const live = !platform.isComingSoon;
  return (
    <Box
      component={motion.div}
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
      sx={{
        '--c': solid, width: { xs: 'calc(50% - 8px)', sm: 196 }, p: 2.5, borderRadius: '16px', bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider', boxShadow: (t) => t.custom.lift(1),
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
        opacity: live ? 1 : 0.7, transition: 'border-color .2s, box-shadow .25s',
        '&:hover': { borderColor: 'var(--c)', boxShadow: (t) => t.custom.lift(3) },
        '&:hover .pp-ico': { transform: 'scale(1.08) rotate(-4deg)' },
      }}
    >
      <Box className="pp-ico" sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'var(--c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform .35s cubic-bezier(.2,.8,.2,1)', '& svg': { fontSize: 24 } }}>
        {Icon && <Icon />}
      </Box>
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>{platform.name}</Typography>
        <Box sx={{ mt: 0.5, display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem', fontWeight: 500, color: live ? 'success.main' : 'text.secondary' }}>
          {live && <CheckIcon sx={{ fontSize: 14 }} />}
          {live ? 'Connected' : 'Coming soon'}
        </Box>
      </Box>
    </Box>
  );
};

const PlatformsSection = () => {
  const platforms = Object.values(appConstants.platforms);
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.95rem' }}>Everywhere your audience is</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}>One dashboard, every platform</Typography>
        </Stack>
        <Box
          component={motion.div}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}
        >
          {platforms.map((p) => <PlatformCard key={p.name} platform={p} />)}
        </Box>
      </Container>
    </Box>
  );
};

export default PlatformsSection;
