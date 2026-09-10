import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button as MuiButton, Link, InputAdornment, IconButton, Alert, Fade, CircularProgress } from '@mui/material';
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

import { authApiAction } from './authApiSlice';
import { useTranslation } from '../../i18n/useTranslation';

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

  // Shared dark/light mode field styles
  const textFieldSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: 2,
      '& fieldset': { borderColor: (theme) => theme.palette.divider },
      '&:hover fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' },
      '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#7C3AED' },
    '& .MuiInputBase-input': { color: 'text.primary' },
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: (theme) => theme.palette.mode === 'dark'
        ? 'radial-gradient(circle at top left, #1f1442 0%, #0A0F1E 100%)'
        : 'radial-gradient(circle at top left, rgba(124, 58, 237, 0.08) 0%, #F8FAFC 100%)',
      p: 2
    }}>
      <Card sx={{
        maxWidth: 440,
        width: '100%',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(10, 15, 30, 0.6)' : theme.palette.background.paper,
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(10px)',
        boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2
            }}>
              <LockResetIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
              {t('forgotPassword')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('step')} {step} {t('of')} 2
            </Typography>
          </Box>

          {/* Error and Success Alerts */}
          {inlineError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: '1px solid rgba(244, 67, 54, 0.3)', '& .MuiAlert-icon': { color: '#f44336' } }}>
              {inlineError}
            </Alert>
          )}
          
          {isAccountNotFound && step === 1 && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {t('accountNotFound')}
              </Typography>
              <Link component={RouterLink} to="/signup" sx={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {t('createANewAccount')}
              </Link>
            </Box>
          )}

          {inlineSuccess && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.3)', '& .MuiAlert-icon': { color: '#4caf50' } }}>
              {inlineSuccess}
            </Alert>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <Fade in={step === 1} timeout={500}>
              <Box component="form" onSubmit={handleSubmitEmail(onSendOtp)} noValidate>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
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
                  sx={{
                    py: 1.5, mt: 1, mb: 2, borderRadius: 2, fontSize: '1rem', fontWeight: 600,
                    background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(124, 58, 237, 0.6)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {isSendingOtp ? <CircularProgress size={24} color="inherit" /> : t('sendOtp')}
                </MuiButton>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link component={RouterLink} to="/login" sx={{ color: 'text.secondary', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
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
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
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
                      textAlign: 'center' 
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
                  sx={{
                    py: 1.5, mt: 1, mb: 3, borderRadius: 2, fontSize: '1rem', fontWeight: 600,
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {isResetting ? <CircularProgress size={24} color="inherit" /> : t('resetPassword')}
                </MuiButton>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link 
                    component="button" 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isSendingOtp}
                    sx={{ 
                      color: resendTimer > 0 ? 'text.disabled' : '#7C3AED', 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      textDecoration: 'none',
                      cursor: resendTimer > 0 ? 'default' : 'pointer',
                      '&:hover': { textDecoration: resendTimer > 0 ? 'none' : 'underline' } 
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

        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordContainer;

