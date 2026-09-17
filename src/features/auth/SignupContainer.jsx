import { Box, IconButton, Typography, Divider, Link, LinearProgress, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HomeIcon from '@mui/icons-material/Home';
import { useState, useMemo } from 'react';
import { showToast } from '../../store/redux/slices/toastSlice';
import { authApiAction } from './authApiSlice';
import Button from '../../common/Button';
import { useTranslation } from '../../i18n/useTranslation';
import GlassCard from '../../common/components/motion/GlassCard';
import { StaggerContainer, StaggerItem } from '../../common/components/motion/Stagger';
import { motion } from 'framer-motion';
import postPilotIcon from '../../assets/brand/postpilot-icon-256.png';
import AuthBackground from '../../common/components/auth/AuthBackground';
import AuthFloatingChips from '../../common/components/auth/AuthFloatingChips';
import usePrefersReducedMotion from '../../features/landing/hooks/usePrefersReducedMotion';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const getPasswordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

const strengthColors = ['#f44336', '#ff9800', '#ff9800', '#4caf50', '#2196f3', '#2196f3'];
const strengthKeys = ['', 'strengthWeak', 'strengthFair', 'strengthFair', 'strengthGood', 'strengthStrong'];

const SignupContainer = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordVal, setPasswordVal] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const reduced  = usePrefersReducedMotion();
  const [signupMutation, { isLoading }] = authApiAction.signup();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const strength = useMemo(() => getPasswordStrength(passwordVal), [passwordVal]);

  const onSubmit = async (data) => {
    try {
      await signupMutation({ name: data.name, email: data.email, password: data.password }).unwrap();
      dispatch(showToast({ message: 'Account created! Please sign in.', variant: 'success' }));
      navigate('/login');
    } catch {
      // Handled by interceptor
    }
  };

  // ── Shared field styles ────────────────────────────────────────────────────

  const inputBoxSx = (hasError) => ({
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${hasError
      ? '#f44336'
      : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.18)'}`,
    borderRadius: '12px',
    px: 1.5,
    py: 0.75,
    backgroundColor: isDark
      ? 'rgba(255,255,255,0.04)'
      : 'rgba(255,255,255,0.65)',
    backdropFilter: 'blur(8px)',
    transition: 'border-color 0.25s, box-shadow 0.25s',
    '&:focus-within': {
      borderColor: '#8B5CF6',
      boxShadow: isDark
        ? '0 0 0 3px rgba(139,92,246,0.18)'
        : '0 0 0 3px rgba(139,92,246,0.12)',
    },
  });

  const nativeInputSx = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: (t) => t.palette.text.primary,
    fontSize: '0.95rem',
    py: 0.5,
    '&::placeholder': { color: (t) => t.palette.text.secondary, opacity: 0.65 },
  };

  // ── FieldBox sub-component ─────────────────────────────────────────────────

  const FieldBox = ({ icon, label, children, error }) => (
    <Box sx={{ mb: 2.25 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block', fontWeight: 500, letterSpacing: '0.02em' }}>
        {label}
      </Typography>
      <Box sx={inputBoxSx(!!error)}>
        <Box sx={{ color: error ? '#f44336' : 'text.secondary', mr: 1, display: 'flex', flexShrink: 0 }}>
          {icon}
        </Box>
        {children}
      </Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ ml: 0.5, mt: 0.4, display: 'block' }}>
          {error.message}
        </Typography>
      )}
    </Box>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, sm: 3 },
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Aurora CSS background */}
      <AuthBackground />

      {/* Back-to-home link */}
      <Box
        component={RouterLink}
        to="/"
        sx={{
          position: 'fixed',
          top: 20,
          left: 24,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
          textDecoration: 'none',
          fontSize: '0.8rem',
          fontWeight: 500,
          transition: 'color 0.2s',
          '&:hover': { color: '#8B5CF6' },
        }}
      >
        <HomeIcon sx={{ fontSize: 16 }} />
        PostPilot
      </Box>

      {/* Card wrapper — chips positioned relative to this */}
      <Box sx={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <AuthFloatingChips />

        <StaggerContainer>

          {/* ── Logo / header ── */}
          <StaggerItem
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}
          >
            {/* Floating logo */}
            <Box
              component={motion.div}
              onClick={() => navigate('/')}
              animate={reduced ? {} : { y: [0, -6, 0] }}
              transition={{ y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } }}
              whileHover={reduced ? {} : { scale: 1.08, rotateY: -15 }}
              sx={{
                width: 68,
                height: 68,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                boxShadow: isDark
                  ? '0 0 40px rgba(139,92,246,0.5), 0 8px 20px rgba(0,0,0,0.35)'
                  : '0 0 32px rgba(139,92,246,0.28), 0 8px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                p: 1,
                perspective: '600px',
                transformStyle: 'preserve-3d',
                transition: 'box-shadow 0.3s',
              }}
            >
              <Box component="img" src={postPilotIcon} alt="PostPilot" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>

            {/* Gradient headline */}
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                textAlign: 'center',
                background: 'linear-gradient(90deg, #A78BFA 0%, #E879F9 50%, #67E8F9 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              {t('createYourAccount')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              {t('signupSubtitle')}
            </Typography>
          </StaggerItem>

          {/* ── Glass card ── */}
          <StaggerItem>
            <GlassCard authCard hoverEffect tilt sx={{ p: { xs: 3, sm: 4 } }}>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* Full Name */}
                <FieldBox label={t('fullName')} icon={<PersonOutlinedIcon sx={{ fontSize: 18 }} />} error={errors.name}>
                  <Box
                    component="input"
                    {...register('name')}
                    placeholder={t('namePlaceholder')}
                    sx={nativeInputSx}
                  />
                </FieldBox>

                {/* Email */}
                <FieldBox label={t('emailAddress')} icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />} error={errors.email}>
                  <Box
                    component="input"
                    {...register('email')}
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    sx={nativeInputSx}
                  />
                </FieldBox>

                {/* Password */}
                <FieldBox label={t('password')} icon={<LockOutlinedIcon sx={{ fontSize: 18 }} />} error={errors.password}>
                  <Box
                    component="input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { onChange: (e) => setPasswordVal(e.target.value) })}
                    sx={nativeInputSx}
                  />
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)} sx={{ color: 'text.secondary', p: 0.5 }}>
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </FieldBox>

                {/* Password strength indicator */}
                {passwordVal && (
                  <Box sx={{ mb: 2.25, mt: -1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(strength / 5) * 100}
                      sx={{
                        height: 3,
                        borderRadius: 2,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: strengthColors[strength],
                          borderRadius: 2,
                          transition: 'background-color 0.3s, width 0.3s',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: strengthColors[strength], mt: 0.5, display: 'block' }}>
                      {strengthKeys[strength] ? t(strengthKeys[strength]) : ''}
                    </Typography>
                  </Box>
                )}

                {/* Confirm Password */}
                <FieldBox label={t('confirmPassword')} icon={<LockOutlinedIcon sx={{ fontSize: 18 }} />} error={errors.confirmPassword}>
                  <Box
                    component="input"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    sx={nativeInputSx}
                  />
                  <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} sx={{ color: 'text.secondary', p: 0.5 }}>
                    {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </FieldBox>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="contained"
                  loading={isLoading}
                  fullWidth
                  sx={{
                    py: 1.5,
                    mt: 0.5,
                    fontSize: '0.98rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 55%, #F472B6 100%)',
                    backgroundSize: '160% 160%',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(192,38,211,0.38)'
                      : '0 8px 24px rgba(139,92,246,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    '&:hover': {
                      boxShadow: isDark
                        ? '0 12px 32px rgba(192,38,211,0.52)'
                        : '0 12px 32px rgba(139,92,246,0.4)',
                      backgroundPosition: '100% 0%',
                      transform: 'perspective(600px) rotateX(6deg) translateY(-2px)',
                    },
                    transition: 'all 0.28s ease',
                  }}
                >
                  {t('createAccount')}
                </Button>

                <Divider sx={{ my: 3, borderColor: 'divider' }} />

                <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                  {t('alreadyHaveAccount')}{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {t('signIn')}
                  </Link>
                </Typography>
              </Box>
            </GlassCard>
          </StaggerItem>

        </StaggerContainer>
      </Box>
    </Box>
  );
};

export default SignupContainer;
