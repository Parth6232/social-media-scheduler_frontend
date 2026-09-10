import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      background: {
        default: isDark ? '#0A0F1E' : '#F8FAFC',
        paper: isDark ? 'rgba(16, 24, 46, 0.6)' : '#FFFFFF',
      },
      primary: {
        main: '#7C3AED', // Purple
        light: '#A78BFA',
        dark: '#5B21B6',
      },
      secondary: {
        main: '#2563EB', // Blue
      },
      text: {
        primary: isDark ? '#F3F4F6' : '#0F172A',
        secondary: isDark ? '#9CA3AF' : '#64748B',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      action: {
        hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 700 },
      h2: { fontSize: '2rem', fontWeight: 700 },
      h3: { fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0A0F1E' : '#F8FAFC',
            color: isDark ? '#F3F4F6' : '#0F172A',
            minHeight: '100vh',
            backgroundImage: isDark
              ? 'radial-gradient(circle at 50% -20%, rgba(124, 58, 237, 0.15), transparent 60%)'
              : 'radial-gradient(circle at 50% -20%, rgba(124, 58, 237, 0.05), transparent 60%)',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(12px)',
            backgroundColor: isDark ? 'rgba(16, 24, 46, 0.6)' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 16,
            boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 24px',
            boxShadow: 'none',
          },
          containedPrimary: {
            background: 'linear-gradient(90deg, #7C3AED 0%, #2563EB 100%)',
            color: '#ffffff',
            '&:hover': {
              boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#7C3AED',
              },
            },
          },
        },
      },
    },
  });
};

const defaultTheme = getAppTheme('dark');
export default defaultTheme;