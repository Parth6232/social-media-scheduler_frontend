import { Box, Card, CardContent, InputAdornment, IconButton, Typography, Divider, Link } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { setCredentials } from '../../store/redux/slices/authSlice';
import { showToast } from '../../store/redux/slices/toastSlice';
import { localStore } from '../../store/localStore';
import { authApiAction } from './authApiSlice';
import Button from '../../common/Button';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginContainer = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginMutation, { isLoading }] = authApiAction.login();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await loginMutation(data).unwrap();
      localStore.setToken(result.token);
      dispatch(setCredentials({ user: result.user, token: result.token }));
      dispatch(showToast({ message: 'Welcome back! 🎉', variant: 'success' }));
      navigate('/dashboard');
    } catch {
      // Error is handled by apiSliceInterceptor
    }
  };

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
        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: 2,
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 2, boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
          }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>S</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>Welcome back</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Sign in to your SocialBlitz account
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Email address
                </Typography>
                <Box sx={{
                  display: 'flex', alignItems: 'center',
                  border: `1px solid ${errors.email ? '#f44336' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 2, px: 1.5, py: 0.5,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  transition: 'border-color 0.2s',
                  '&:focus-within': { borderColor: '#7C3AED' }
                }}>
                  <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
                  <Box
                    component="input"
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    sx={{
                      flex: 1, border: 'none', outline: 'none', background: 'transparent',
                      color: '#F3F4F6', fontSize: '0.95rem', py: 1,
                      '&::placeholder': { color: 'rgba(255,255,255,0.3)' }
                    }}
                  />
                </Box>
                {errors.email && <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>{errors.email.message}</Typography>}
              </Box>

              {/* Password */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Password
                </Typography>
                <Box sx={{
                  display: 'flex', alignItems: 'center',
                  border: `1px solid ${errors.password ? '#f44336' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 2, px: 1.5, py: 0.5,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  transition: 'border-color 0.2s',
                  '&:focus-within': { borderColor: '#7C3AED' }
                }}>
                  <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
                  <Box
                    component="input"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    sx={{
                      flex: 1, border: 'none', outline: 'none', background: 'transparent',
                      color: '#F3F4F6', fontSize: '0.95rem', py: 1,
                      '&::placeholder': { color: 'rgba(255,255,255,0.3)' }
                    }}
                  />
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)} sx={{ color: 'text.secondary' }}>
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </Box>
                {errors.password && <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>{errors.password.message}</Typography>}
              </Box>

              <Button
                type="submit"
                variant="contained"
                loading={isLoading}
                fullWidth
                sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}
              >
                Sign In
              </Button>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

            <Typography variant="body2" textAlign="center" sx={{ color: 'text.secondary' }}>
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/signup" sx={{ color: 'primary.light', fontWeight: 600, textDecoration: 'none' }}>
                Create one free
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginContainer;
