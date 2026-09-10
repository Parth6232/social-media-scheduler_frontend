import { Box, Card, CardContent, IconButton, Typography, Divider, Link, LinearProgress } from '@mui/material';
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
import { useState, useMemo } from 'react';
import { showToast } from '../../store/redux/slices/toastSlice';
import { authApiAction } from './authApiSlice';
import Button from '../../common/Button';
import { useTranslation } from '../../i18n/useTranslation';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const FieldBox = ({ icon, children, error, label }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>{label}</Typography>
    <Box sx={{
      display: 'flex', alignItems: 'center',
      border: (theme) => `1px solid ${error ? '#f44336' : theme.palette.divider}`,
      borderRadius: 2, px: 1.5, py: 0.5,
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      '&:focus-within': { borderColor: '#7C3AED' }
    }}>
      <Box sx={{ color: 'text.secondary', mr: 1, display: 'flex' }}>{icon}</Box>
      {children}
    </Box>
    {error && <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>{error.message}</Typography>}
  </Box>
);

const InputField = ({ type = 'text', placeholder, ...rest }) => (
  <Box
    component="input"
    type={type}
    placeholder={placeholder}
    sx={{
      flex: 1, border: 'none', outline: 'none', background: 'transparent',
      color: (theme) => theme.palette.text.primary, fontSize: '0.95rem', py: 1,
      '&::placeholder': { color: (theme) => theme.palette.text.secondary, opacity: 0.7 }
    }}
    {...rest}
  />
);

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

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      background: (theme) => theme.palette.mode === 'dark'
        ? 'radial-gradient(ellipse at top left, rgba(124, 58, 237, 0.2) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(37, 99, 235, 0.15) 0%, transparent 50%)'
        : 'radial-gradient(ellipse at top left, rgba(124, 58, 237, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(37, 99, 235, 0.08) 0%, transparent 50%)',
    }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: 2,
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 2, boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
          }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>S</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>{t('createYourAccount')}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {t('signupSubtitle')}
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldBox label={t('fullName')} icon={<PersonOutlinedIcon sx={{ fontSize: 20 }} />} error={errors.name}>
                <InputField placeholder={t('namePlaceholder')} {...register('name')} />
              </FieldBox>

              <FieldBox label={t('emailAddress')} icon={<EmailOutlinedIcon sx={{ fontSize: 20 }} />} error={errors.email}>
                <InputField type="email" placeholder={t('emailPlaceholder')} {...register('email')} />
              </FieldBox>

              <FieldBox label={t('password')} icon={<LockOutlinedIcon sx={{ fontSize: 20 }} />} error={errors.password}>
                <InputField
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { onChange: (e) => setPasswordVal(e.target.value) })}
                />
                <IconButton size="small" onClick={() => setShowPassword(!showPassword)} sx={{ color: 'text.secondary' }}>
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </FieldBox>

              {/* Password strength indicator */}
              {passwordVal && (
                <Box sx={{ mb: 2.5, mt: -1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(strength / 5) * 100}
                    sx={{
                      height: 4, borderRadius: 2,
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      '& .MuiLinearProgress-bar': { backgroundColor: strengthColors[strength], borderRadius: 2 }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: strengthColors[strength], mt: 0.5, display: 'block' }}>
                    {strengthKeys[strength] ? t(strengthKeys[strength]) : ''}
                  </Typography>
                </Box>
              )}

              <FieldBox label={t('confirmPassword')} icon={<LockOutlinedIcon sx={{ fontSize: 20 }} />} error={errors.confirmPassword}>
                <InputField
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} sx={{ color: 'text.secondary' }}>
                  {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </FieldBox>

              <Button
                type="submit"
                variant="contained"
                loading={isLoading}
                fullWidth
                sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}
              >
                {t('createAccount')}
              </Button>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'divider' }} />
            <Typography variant="body2" textAlign="center" sx={{ color: 'text.secondary' }}>
              {t('alreadyHaveAccount')}{' '}
              <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                {t('signIn')}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SignupContainer;
