import {
  Box, IconButton,
  Typography, Divider, Link, Fade, Alert, useTheme,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useState } from 'react';
import { setCredentials } from '../../store/redux/slices/authSlice';
import { showToast } from '../../store/redux/slices/toastSlice';
import { localStore } from '../../store/localStore';
import { authApiAction } from './authApiSlice';
import { getDeviceId } from '../../utils/deviceId';
import Button from '../../common/Button';
import { useTranslation } from '../../i18n/useTranslation';
import GlassCard from '../../common/components/motion/GlassCard';
import { StaggerContainer, StaggerItem } from '../../common/components/motion/Stagger';
import { motion } from 'framer-motion';
import postPilotIcon from '../../assets/brand/postpilot-icon-256.png';
import AuthBackground from '../../common/components/auth/AuthBackground';
import AuthFloatingChips from '../../common/components/auth/AuthFloatingChips';
import usePrefersReducedMotion from '../../features/landing/hooks/usePrefersReducedMotion';

// ── Zod schemas ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP exactly 6 digits hona chahiye')
    .regex(/^\d{6}$/, 'Sirf numbers allowed hain'),
});

// ── Component ────────────────────────────────────────────────────────────────

const LoginContainer = () => {
  const { t } = useTranslation();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isDark    = theme.palette.mode === 'dark';
  const reduced   = usePrefersReducedMotion();

  // step: 1 = login form, 2 = OTP verification
  const [step, setStep]               = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [otpEmail, setOtpEmail]       = useState('');
  const [otpDeviceId, setOtpDeviceId] = useState('');
  const [inlineOtpError, setInlineOtpError] = useState('');

  // RTK mutations
  const [loginMutation,     { isLoading: isLoggingIn }]  = authApiAction.login();
  const [verifyOtpMutation, { isLoading: isVerifying }]  = authApiAction.verifyDeviceOtp();

  // ── Step 1 form ────────────────────────────────────────────────────────────
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onLoginSubmit = async (data) => {
    const deviceId = getDeviceId();
    try {
      const result = await loginMutation({ ...data, deviceId }).unwrap();

      if (result.otpRequired) {
        // New device — switch to OTP step
        setOtpEmail(result.email);
        setOtpDeviceId(deviceId);
        setStep(2);
        return;
      }

      // Trusted device — normal login complete
      localStore.setToken(result.token);
      dispatch(setCredentials({ user: result.user, token: result.token }));
      dispatch(showToast({ message: 'Welcome back! 🎉', variant: 'success' }));
      navigate('/dashboard');
    } catch {
      // Errors (wrong password, network, etc.) handled by apiSliceInterceptor
    }
  };

  // ── Step 2 form ────────────────────────────────────────────────────────────
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    reset: resetOtpForm,
  } = useForm({ resolver: zodResolver(otpSchema) });

  const onOtpSubmit = async ({ otp }) => {
    setInlineOtpError('');
    try {
      const result = await verifyOtpMutation({
        email: otpEmail,
        otp,
        deviceId: otpDeviceId,
      }).unwrap();

      localStore.setToken(result.token);
      dispatch(setCredentials({ user: result.user, token: result.token }));
      dispatch(showToast({ message: '✅ Device verified! Welcome back!', variant: 'success' }));
      navigate('/dashboard');
    } catch (err) {
      // Show inline error in addition to the interceptor toast
      const msg = err?.data?.message || 'OTP verification failed. Please try again.';
      setInlineOtpError(msg);
    }
  };

  const handleBackToLogin = () => {
    setStep(1);
    setOtpEmail('');
    setOtpDeviceId('');
    setInlineOtpError('');
    resetOtpForm();
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

      {/* Back-to-home link — top-left corner */}
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

      {/* Card wrapper — chips are positioned relative to this */}
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
              transition={{ y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } }}
              whileHover={reduced ? {} : { scale: 1.08, rotateY: 15 }}
              sx={{
                width: 68,
                height: 68,
                borderRadius: '18px',
                background: step === 1
                  ? 'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)'
                  : 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
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
              {step === 1
                ? <Box component="img" src={postPilotIcon} alt="PostPilot" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <SecurityIcon sx={{ color: '#fff', fontSize: 32 }} />
              }
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
              {step === 1 ? t('welcomeBack') : t('verifyYourDevice')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              {step === 1 ? t('signInSubtitle') : t('otpSentSubtitle')}
            </Typography>
          </StaggerItem>

          {/* ── Glass card ── */}
          <StaggerItem>
            <GlassCard authCard hoverEffect tilt sx={{ p: { xs: 3, sm: 4 } }}>

              {/* ════════════════════════════════════════
                  STEP 1 — Email + Password form
              ════════════════════════════════════════ */}
              <Fade in={step === 1} timeout={400} unmountOnExit>
                <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate>

                  {/* Email */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block', fontWeight: 500, letterSpacing: '0.02em' }}>
                      {t('emailAddress')}
                    </Typography>
                    <Box sx={inputBoxSx(!!loginErrors.email)}>
                      <EmailOutlinedIcon sx={{ color: loginErrors.email ? '#f44336' : 'text.secondary', fontSize: 18, mr: 1, flexShrink: 0 }} />
                      <Box
                        component="input"
                        {...registerLogin('email')}
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        sx={nativeInputSx}
                      />
                    </Box>
                    {loginErrors.email && (
                      <Typography variant="caption" color="error" sx={{ ml: 0.5, mt: 0.4, display: 'block' }}>
                        {loginErrors.email.message}
                      </Typography>
                    )}
                  </Box>

                  {/* Password */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: '0.02em' }}>
                        {t('password')}
                      </Typography>
                      <Link
                        component={RouterLink}
                        to="/forgot-password"
                        sx={{
                          color: 'primary.main',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {t('forgotPasswordQuestion')}
                      </Link>
                    </Box>
                    <Box sx={inputBoxSx(!!loginErrors.password)}>
                      <LockOutlinedIcon sx={{ color: loginErrors.password ? '#f44336' : 'text.secondary', fontSize: 18, mr: 1, flexShrink: 0 }} />
                      <Box
                        component="input"
                        {...registerLogin('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        sx={nativeInputSx}
                      />
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)} sx={{ color: 'text.secondary', p: 0.5 }}>
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </Box>
                    {loginErrors.password && (
                      <Typography variant="caption" color="error" sx={{ ml: 0.5, mt: 0.4, display: 'block' }}>
                        {loginErrors.password.message}
                      </Typography>
                    )}
                  </Box>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="contained"
                    loading={isLoggingIn}
                    fullWidth
                    sx={{
                      py: 1.5,
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
                    {t('signIn')}
                  </Button>

                  <Divider sx={{ my: 3, borderColor: 'divider' }} />

                  <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                    {t('dontHaveAccount')}{' '}
                    <Link
                      component={RouterLink}
                      to="/signup"
                      sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {t('createOneFree')}
                    </Link>
                  </Typography>
                </Box>
              </Fade>

              {/* ════════════════════════════════════════
                  STEP 2 — OTP Verification form
              ════════════════════════════════════════ */}
              <Fade in={step === 2} timeout={400} unmountOnExit>
                <Box component="form" onSubmit={handleOtpSubmit(onOtpSubmit)} noValidate>

                  {/* Warning banner */}
                  <Alert
                    severity="warning"
                    icon={<SecurityIcon fontSize="small" />}
                    sx={{
                      mb: 3, borderRadius: '12px',
                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.22)',
                      color: 'text.primary',
                      '& .MuiAlert-icon': { color: '#FBBF24' },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      {t('newDeviceDetected')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
                      {t('enterOtpNotice')} <strong>{otpEmail}</strong> {t('toCompleteLogin')}
                    </Typography>
                  </Alert>

                  {/* OTP Input */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block', textAlign: 'center', fontWeight: 500 }}>
                      {t('sixDigitOtp')}
                    </Typography>
                    <Box sx={{ ...inputBoxSx(!!otpErrors.otp || !!inlineOtpError), justifyContent: 'center' }}>
                      <KeyIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 1, flexShrink: 0 }} />
                      <Box
                        component="input"
                        {...registerOtp('otp')}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="• • • • • •"
                        autoFocus
                        sx={{
                          ...nativeInputSx,
                          letterSpacing: '0.6em',
                          fontSize: '1.4rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          fontFamily: 'monospace',
                        }}
                      />
                    </Box>
                    {otpErrors.otp && (
                      <Typography variant="caption" color="error" sx={{ ml: 0.5, display: 'block', mt: 0.5 }}>
                        {otpErrors.otp.message}
                      </Typography>
                    )}
                    {inlineOtpError && !otpErrors.otp && (
                      <Typography variant="caption" sx={{ color: '#f87171', ml: 0.5, display: 'block', mt: 0.5 }}>
                        {inlineOtpError}
                      </Typography>
                    )}
                  </Box>

                  {/* Verify button */}
                  <Button
                    type="submit"
                    variant="contained"
                    loading={isVerifying}
                    fullWidth
                    sx={{
                      py: 1.5, fontSize: '0.98rem', borderRadius: '12px',
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
                    {t('verifyAndSignIn')}
                  </Button>

                  {/* Back link */}
                  <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                    <Link
                      component="button"
                      type="button"
                      onClick={handleBackToLogin}
                      sx={{
                        color: 'text.secondary', fontSize: '0.85rem',
                        textDecoration: 'none', display: 'inline-flex',
                        alignItems: 'center', gap: 0.5,
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      <ArrowBackIcon sx={{ fontSize: 14 }} />
                      {t('backToLogin')}
                    </Link>
                  </Box>
                </Box>
              </Fade>

            </GlassCard>
          </StaggerItem>
        </StaggerContainer>
      </Box>
    </Box>
  );
};


export default LoginContainer;
