import { createTheme } from '@mui/material/styles';

// Shared glossy "aurora" gradient tokens — violet → fuchsia, with cyan kept only
// as a tiny glow/highlight accent instead of the old flat electric-blue.
export const auroraGradients = {
  primary: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 55%, #F472B6 100%)',
  primarySoft: 'linear-gradient(135deg, rgba(124,58,237,0.16) 0%, rgba(192,38,211,0.16) 55%, rgba(244,114,182,0.16) 100%)',
  glow: 'radial-gradient(circle, #22D3EE 0%, transparent 70%)',
  text: 'linear-gradient(90deg, #A78BFA 0%, #E879F9 50%, #67E8F9 100%)',
};

export const getAppTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    custom: {
      gradients: auroraGradients,
    },
    palette: {
      mode: isDark ? 'dark' : 'light',
      background: {
        default: isDark ? '#05070e' : '#F8FAFC',
        paper: isDark ? 'rgba(12, 17, 34, 0.4)' : 'rgba(255, 255, 255, 0.7)',
      },
      primary: {
        main: '#8B5CF6', // Violet
        light: '#C4B5FD',
        dark: '#6D28D9',
      },
      secondary: {
        main: '#D946EF', // Fuchsia — replaces the old electric-blue accent
        light: '#F0ABFC',
        dark: '#A21CAF',
      },
      info: {
        main: '#22D3EE', // Cyan kept only as a small glow/highlight accent
      },
      text: {
        primary: isDark ? '#F3F4F6' : '#0F172A',
        secondary: isDark ? '#9CA3AF' : '#64748B',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      action: {
        hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontFamily: '"Space Grotesk", sans-serif', fontSize: '2.75rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontFamily: '"Space Grotesk", sans-serif', fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontFamily: '"Space Grotesk", sans-serif', fontSize: '1rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#05070e' : '#F8FAFC',
            color: isDark ? '#F3F4F6' : '#0F172A',
            minHeight: '100vh',
            // Base ambient dark background without overwhelming the 3D element
            backgroundImage: isDark
              ? 'radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.09), transparent 40%), radial-gradient(circle at 90% 80%, rgba(217, 70, 239, 0.08), transparent 40%)'
              : 'radial-gradient(circle at 50% -20%, rgba(139, 92, 246, 0.06), transparent 60%), radial-gradient(circle at 100% 10%, rgba(217, 70, 239, 0.05), transparent 50%)',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(16px)',
            backgroundColor: isDark ? 'rgba(12, 17, 34, 0.45)' : 'rgba(255, 255, 255, 0.65)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 20,
            boxShadow: isDark ? '0 12px 40px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            boxShadow: 'none',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'perspective(600px) rotateX(6deg) translateY(-2px)',
            },
            '&:active': {
              transform: 'perspective(600px) rotateX(2deg) translateY(0px) scale(0.98)',
            },
          },
          containedPrimary: {
            background: auroraGradients.primary,
            backgroundSize: '160% 160%',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            '&:hover': {
              boxShadow: '0 12px 28px rgba(192, 38, 211, 0.4)',
              backgroundPosition: '100% 0%',
              transform: 'perspective(600px) rotateX(6deg) translateY(-2px)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
              transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.12)',
                transition: 'border-color 0.3s',
              },
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FDFDFD',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.25)',
              },
              '&.Mui-focused': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : '#FFFFFF',
                boxShadow: isDark ? '0 0 15px rgba(139, 92, 246, 0.25)' : 'none',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8B5CF6',
                borderWidth: '1px',
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(20px)',
            backgroundColor: isDark ? 'rgba(12, 17, 34, 0.7)' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            borderRadius: 24,
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))',
          }
        }
      }
    },
  });
};

const defaultTheme = getAppTheme('dark');
export default defaultTheme;