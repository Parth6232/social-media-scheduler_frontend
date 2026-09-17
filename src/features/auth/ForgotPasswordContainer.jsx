import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button as MuiButton, Link,
  InputAdornment, IconButton, Alert, Fade, CircularProgress, useTheme,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockIcon from '@mui/icons-material/Lock';
import PasswordIcon from '@mui/icons-material/Password';
import HomeIcon from '@mui/icons-material/Home';

import { motion } from 'framer-motion';

import { authApiAction } from './authApiSlice';
import { useTranslation } from '../../i18n/useTranslation';
import GlassCard from '../../common/components/motion/GlassCard';
import { StaggerContainer, StaggerItem } from '../../common/components/motion/Stagger';
import AuthBackground from '../../common/components/auth/AuthBackground';
import AuthFloatingChips from '../../common/components/auth/AuthFloatingChips';
import usePrefersReducedMotion from '../../features/landing/hooks/usePrefersReducedMotion';

// Zod schemas
const emailSchema = z.object({
  email: z.string().min(1, 'Email zaroori hai').email('Valid email address daaliye'),
});

const resetSchema = z.object({
  otp: z.string().min(6, '6 digit OTP daaliye').max(6, '6 digit OTP daaliye').regex(/^\d+$/, 'Sirf numbers allowed hain'),
  newPassword: z.string().min(6, 'Password kam se kam 6 characters ka hona chahiye'),
  confirmPassword: z.string().min(1, 'Confirm password zaroori hai'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords match nahi kar rahe",
  path: ["confirmPassword"],
});

const ForgotPasswordContainer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const reduced  = usePrefersReducedMotion();

  const [step, setStep] = useState(1);
  const [emailValue, setEmailValue] = useState('');

  // API Mutations
  const [forgotPassword, { isLoading: isSendingOtp }] = authApiAction.forgotPassword();
  const [resetPassword, { isLoading: isResetting }] = authApiAction.resetPassword();

  // Step 1 Form
  const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: errorsEmail } } = useForm({
    resolver: zodResolver(emailSchema),
  });

  // Step 2 Form
  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: errorsReset } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  // Local state for UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [inlineError, setInlineError] = useState('');
  const [inlineSuccess, setInlineSuccess] = useState('');
  const [isAccountNotFound, setIsAccountNotFound] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  // Timer effect for Resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onSendOtp = async (data) => {
    setInlineError('');
    setInlineSuccess('');
    setIsAccountNotFound(false);

    try {
      const res = await forgotPassword({ email: data.email }).unwrap();
      setEmailValue(data.email);
      setInlineSuccess(res.message || 'Is email pe OTP bhej diya gaya hai. Check your inbox (and spam folder).');
      setResendTimer(30); // 30 seconds cooldown

      // Move to step 2 after a short delay
      setTimeout(() => {
        setStep(2);
        setInlineSuccess(''); // Clear success message from step 1 when moving to step 2
      }, 1500);
    } catch (err) {
      const errMsg = err?.data?.message || 'Kuch galat ho gaya, phir se try karein';
      setInlineError(errMsg);
      if (err?.status === 404) {
        setIsAccountNotFound(true);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setInlineError('');
    setInlineSuccess('');

    try {
      const res = await forgotPassword({ email: emailValue }).unwrap();
      setInlineSuccess('OTP phir se bhej diya gaya hai!');
      setResendTimer(30);
    } catch (err) {
      setInlineError(err?.data?.message || 'OTP bhejne mein error aaya');
    }
  };

  const onResetPassword = async (data) => {
    setInlineError('');
    setInlineSuccess('');

    try {
      const res = await resetPassword({
        email: emailValue,
        otp: data.otp,
        newPassword: data.newPassword
      }).unwrap();

      setInlineSuccess(res.message || 'Password successfully reset ho gaya!');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setInlineError(err?.data?.message || 'Password reset failed, try again');
    }
  };

  // ── Shared MUI TextField sx (kept for ForgotPassword which uses MUI TextField) ──
  const textFieldSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(8px)',
      borderRadius: '12px',
      '& fieldset': {
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.18)',
      },
      '&:hover fieldset': {
        borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(139,92,246,0.32)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#8B5CF6',
        borderWidth: '1px',
      },
      '&.Mui-focused': {
        boxShadow: isDark
          ? '0 0 0 3px rgba(139,92,246,0.18)'
          : '0 0 0 3px rgba(139,92,246,0.12)',
      },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#8B5CF6' },
    '& .MuiInputBase-input': { color: 'text.primary' },
  };

  // Shared gradient button sx
  const gradientBtnSx = {
    py: 1.5,
    mt: 1,
    mb: 2,
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 55%, #F472B6 100%)',
    backgroundSize: '160% 160%',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: isDark
      ? '0 8px 24px rgba(192,38,211,0.38)'
      : '0 8px 24px rgba(139,92,246,0.3)',
    transition: 'all 0.28s ease',
    '&:hover': {
      boxShadow: isDark
        ? '0 12px 32px rgba(192,38,211,0.52)'
        : '0 12px 32px rgba(139,92,246,0.4)',
      backgroundPosition: '100% 0%',
      transform: 'perspective(600px) rotateX(6deg) translateY(-2px)',
    },
  };

  // Step indicator dots
  const StepDots = () => (
    <Box sx={{ display: 'flex', gap: 0.75, mt: 1, justifyContent: 'center' }}>
      {[1, 2].map((s) => (
        <Box
          key={s}
          component={motion.div}
          animate={{ scale: step === s ? 1.3 : 1 }}
          sx={{
            width: step === s ? 20 : 8,
            height: 8,
            borderRadius: 4,
            background: step === s
              ? 'linear-gradient(90deg, #8B5CF6, #D946EF)'
              : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
            transition: 'width 0.3s ease, background 0.3s ease',
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      p: { xs: 2, sm: 3 },
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

      {/* Card wrapper */}
      <Box sx={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <AuthFloatingChips />

        <StaggerContainer>

          {/* ── Logo / header ── */}
          <StaggerItem
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}
          >
            {/* Floating icon */}
            <Box
              component={motion.div}
              animate={reduced ? {} : { y: [0, -6, 0] }}
              transition={{ y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }}
              whileHover={reduced ? {} : { scale: 1.08, rotateY: 20 }}
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 55%, #F472B6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                boxShadow: isDark
                  ? '0 0 40px rgba(139,92,246,0.5), 0 8px 20px rgba(0,0,0,0.35)'
                  : '0 0 32px rgba(139,92,246,0.28), 0 8px 20px rgba(0,0,0,0.1)',
                perspective: '600px',
                transformStyle: 'preserve-3d',
                cursor: 'default',
              }}
            >
              <LockResetIcon sx={{ color: '#fff', fontSize: 32 }} />
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
              {t('forgotPassword')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              {t('step')} {step} {t('of')} 2
            </Typography>

            {/* Step progress dots */}
            <StepDots />
          </StaggerItem>

          {/* ── Glass card ── */}
          <StaggerItem>
            <GlassCard authCard hoverEffect tilt sx={{ p: { xs: 3, sm: 4 } }}>

              {/* Error and Success Alerts */}
              {inlineError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3, borderRadius: '12px',
                    backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    border: '1px solid rgba(244, 67, 54, 0.22)',
                    color: 'text.primary',
                    '& .MuiAlert-icon': { color: '#f44336' },
                  }}
                >
                  {inlineError}
                </Alert>
              )}

              {isAccountNotFound && step === 1 && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {t('accountNotFound')}
                  </Typography>
                  <Link
                    component={RouterLink}
                    to="/signup"
                    sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {t('createANewAccount')}
                  </Link>
                </Box>
              )}

              {inlineSuccess && (
                <Alert
                  severity="success"
    
                  sx={{
                    mb: 3, borderRadius: '12px',
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    border: '1px solid rgba(76, 175, 80, 0.22)',
                    color: 'text.primary',
                    '& .MuiAlert-icon': { color: '#4caf50' },
                  }}
                >
                  {inlineSuccess}
                </Alert>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <Fade in={step === 1} timeout={500}>
                  <Box component="form" onSubmit={handleSubmitEmail(onSendOtp)} noValidate>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', lineHeight: 1.6 }}>
                      {t('step1Desc')}
                    </Typography>

                    <TextField
                      fullWidth
                      id="email"
                      label={t('emailAddress')}
                      variant="outlined"
                      {...registerEmail('email')}
                      error={!!errorsEmail.email}
                      helperText={errorsEmail.email?.message}
                      disabled={isSendingOtp}
                      sx={textFieldSx}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }
                      }}
                    />

                    <MuiButton
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isSendingOtp}
                      sx={gradientBtnSx}
                    >
                      {isSendingOtp ? <CircularProgress size={22} color="inherit" /> : t('sendOtp')}
                    </MuiButton>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Link
                        component={RouterLink}
                        to="/login"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {t('backToLogin')}
                      </Link>
                    </Box>
                  </Box>
                </Fade>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <Fade in={step === 2} timeout={500}>
                  <Box component="form" onSubmit={handleSubmitReset(onResetPassword)} noValidate>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', lineHeight: 1.6 }}>
                      {t('step2Desc')}
                    </Typography>

                    <TextField
                      fullWidth
                      id="otp"
                      label={t('sixDigitOtp')}
                      variant="outlined"
                      inputMode="numeric"
                      {...registerReset('otp')}
                      error={!!errorsReset.otp}
                      helperText={errorsReset.otp?.message}
                      disabled={isResetting}
                      sx={{
                        ...textFieldSx,
                        '& .MuiInputBase-input': {
                          color: 'text.primary',
                          letterSpacing: '12px',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          textAlign: 'center',
                        },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PasswordIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      id="newPassword"
                      label={t('newPassword')}
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      {...registerReset('newPassword')}
                      error={!!errorsReset.newPassword}
                      helperText={errorsReset.newPassword?.message}
                      disabled={isResetting}
                      sx={textFieldSx}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      id="confirmPassword"
                      label={t('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      variant="outlined"
                      {...registerReset('confirmPassword')}
                      error={!!errorsReset.confirmPassword}
                      helperText={errorsReset.confirmPassword?.message}
                      disabled={isResetting}
                      sx={textFieldSx}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />

                    <MuiButton
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isResetting}
                      sx={{ ...gradientBtnSx, mb: 3 }}
                    >
                      {isResetting ? <CircularProgress size={22} color="inherit" /> : t('resetPassword')}
                    </MuiButton>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Link
                        component="button"
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || isSendingOtp}
                        sx={{
                          color: resendTimer > 0 ? 'text.disabled' : 'primary.main',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          cursor: resendTimer > 0 ? 'default' : 'pointer',
                          '&:hover': { textDecoration: resendTimer > 0 ? 'none' : 'underline' },
                        }}
                      >
                        {resendTimer > 0 ? `${t('resendOtpIn')} ${resendTimer}s` : t('resendOtp')}
                      </Link>

                      <Link
                        component="button"
                        type="button"
                        onClick={() => { setStep(1); setInlineError(''); setInlineSuccess(''); }}
                        sx={{ color: 'text.secondary', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                      >
                        {t('changeEmail')}
                      </Link>
                    </Box>
                  </Box>
                </Fade>
              )}

            </GlassCard>
          </StaggerItem>

        </StaggerContainer>
      </Box>
    </Box>
  );
};

export default ForgotPasswordContainer;
