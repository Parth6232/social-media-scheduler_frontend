import {
  Box, Card, CardContent, InputAdornment, IconButton,
  Typography, Divider, Link, Fade, Alert,
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
import { useState } from 'react';
import { setCredentials } from '../../store/redux/slices/authSlice';
import { showToast } from '../../store/redux/slices/toastSlice';
import { localStore } from '../../store/localStore';
import { authApiAction } from './authApiSlice';
import { getDeviceId } from '../../utils/deviceId';
import Button from '../../common/Button';

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

// ── Shared input box style ───────────────────────────────────────────────────

const inputBoxSx = (hasError) => ({
  display: 'flex', alignItems: 'center',
  border: `1px solid ${hasError ? '#f44336' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: 2, px: 1.5, py: 0.5,
  backgroundColor: 'rgba(255,255,255,0.03)',
  transition: 'border-color 0.2s',
  '&:focus-within': { borderColor: '#7C3AED' },
});

const nativeInputSx = {
  flex: 1, border: 'none', outline: 'none', background: 'transparent',
  color: '#F3F4F6', fontSize: '0.95rem', py: 1,
  '&::placeholder': { color: 'rgba(255,255,255,0.3)' },
};

// ── Component ────────────────────────────────────────────────────────────────

const LoginContainer = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      background: 'radial-gradient(ellipse at top left, rgba(124, 58, 237, 0.2) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(37, 99, 235, 0.15) 0%, transparent 50%)',
    }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>

        {/* ── Logo / header ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: 2,
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 2, boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
            transition: 'all 0.4s ease',
          }}>
            {step === 1
              ? <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>S</Typography>
              : <SecurityIcon sx={{ color: '#fff', fontSize: 28 }} />
            }
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
            {step === 1 ? 'Welcome back' : 'Verify Your Device'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'center' }}>
            {step === 1
              ? 'Sign in to your SocialBlitz account'
              : 'OTP aapke registered email par bheja gaya hai'
            }
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, p: 1 }}>
          <CardContent sx={{ p: 3 }}>

            {/* ════════════════════════════════════════
                STEP 1 — Email + Password form
            ════════════════════════════════════════ */}
            <Fade in={step === 1} timeout={400} unmountOnExit>
              <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate>

                {/* Email */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                    Email address
                  </Typography>
                  <Box sx={inputBoxSx(!!loginErrors.email)}>
                    <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
                    <Box
                      component="input"
                      {...registerLogin('email')}
                      type="email"
                      placeholder="you@example.com"
                      sx={nativeInputSx}
                    />
                  </Box>
                  {loginErrors.email && (
                    <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>
                      {loginErrors.email.message}
                    </Typography>
                  )}
                </Box>

                {/* Password */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Password
                    </Typography>
                    <Link component={RouterLink} to="/forgot-password" sx={{ color: 'primary.light', fontSize: '0.75rem', textDecoration: 'none' }}>
                      Forgot password?
                    </Link>
                  </Box>
                  <Box sx={inputBoxSx(!!loginErrors.password)}>
                    <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
                    <Box
                      component="input"
                      {...registerLogin('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      sx={nativeInputSx}
                    />
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} sx={{ color: 'text.secondary' }}>
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                  {loginErrors.password && (
                    <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>
                      {loginErrors.password.message}
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  loading={isLoggingIn}
                  fullWidth
                  sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}
                >
                  Sign In
                </Button>

                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

                <Typography variant="body2" textAlign="center" sx={{ color: 'text.secondary' }}>
                  Don&apos;t have an account?{' '}
                  <Link component={RouterLink} to="/signup" sx={{ color: 'primary.light', fontWeight: 600, textDecoration: 'none' }}>
                    Create one free
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
                    mb: 3, borderRadius: 2,
                    backgroundColor: 'rgba(251, 191, 36, 0.08)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    color: '#FDE68A',
                    '& .MuiAlert-icon': { color: '#FBBF24' },
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    🔐 Naya Device Detect Hua
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all' }}>
                    <strong>{otpEmail}</strong> par bheja gaya OTP daalein taaki login complete ho sake.
                  </Typography>
                </Alert>

                {/* OTP Input */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', textAlign: 'center' }}>
                    6-Digit OTP
                  </Typography>
                  <Box sx={{
                    ...inputBoxSx(!!otpErrors.otp || !!inlineOtpError),
                    justifyContent: 'center',
                  }}>
                    <KeyIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1, flexShrink: 0 }} />
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
                  {/* Validation error */}
                  {otpErrors.otp && (
                    <Typography variant="caption" color="error" sx={{ ml: 0.5, display: 'block', mt: 0.5 }}>
                      {otpErrors.otp.message}
                    </Typography>
                  )}
                  {/* Inline API error */}
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
                    py: 1.5, fontSize: '1rem', borderRadius: 2,
                    background: 'linear-gradient(90deg, #7C3AED, #2563EB)',
                    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(124, 58, 237, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  ✓ Verify &amp; Sign In
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
                      '&:hover': { color: '#fff' },
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 14 }} />
                    Back to Login
                  </Link>
                </Box>
              </Box>
            </Fade>

          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginContainer;
