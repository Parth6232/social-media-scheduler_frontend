import { createTheme } from '@mui/material/styles';

// Flat product UI: hairline borders, one solid accent, restrained shadows, crisp type.
export const signal = {
  // legacy keys kept for older imports (all solid now)
  pink: '#2563EB', pinkDeep: '#1D4ED8', yellow: '#F5A524', lime: '#12B76A', sky: '#0EA5E9', rose: '#F04438',
  button: '#2563EB',
  horizon: '#2563EB',
};
export const auroraGradients = { primary: signal.button, text: signal.horizon }; // legacy alias
export const panelTexture = 'none';

const EASE = 'cubic-bezier(.2,.8,.2,1)';

export const getAppTheme = (mode = 'light') => {
  const d = mode === 'dark';
  const accent = d ? '#4F8BFF' : '#2563EB';
  const ink = d ? '#ECEEF2' : '#101828';
  const muted = d ? '#8B93A1' : '#667085';
  const bg = d ? '#0A0B0E' : '#F6F7F9';
  const panel = d ? '#111317' : '#FFFFFF';
  const line = d ? 'rgba(255,255,255,0.09)' : '#E4E7EC';
  const lineStrong = d ? 'rgba(255,255,255,0.18)' : '#CBD0D8';
  const lift = (n = 1) => (d
    ? `0 0 0 1px rgba(255,255,255,0.02), 0 ${1 * n}px ${3 * n}px rgba(0,0,0,.4)`
    : `0 ${1 * n}px ${2 * n}px rgba(16,24,40,.05), 0 ${2 * n}px ${6 * n}px rgba(16,24,40,.04)`);

  return createTheme({
    custom: {
      ink, panel, panelSolid: panel, line, lineStrong, lift, hard: lift, ease: EASE, bounce: EASE, bg, accent,
      edge: 'none', glow: 'transparent',
      yellow: signal.yellow, lime: signal.lime, sky: signal.sky, pink: accent,
      gradients: { text: `linear-gradient(${ink}, ${ink})`, primary: `linear-gradient(${accent}, ${accent})` },
    },
    palette: {
      mode,
      background: { default: bg, paper: panel },
      primary: { main: accent, light: d ? '#7AA7FF' : '#3B82F6', dark: d ? '#3A74EA' : '#1D4ED8', contrastText: '#fff' },
      secondary: { main: '#0EA5E9' },
      info: { main: '#0EA5E9' },
      success: { main: '#12B76A' },
      warning: { main: '#F5A524' },
      error: { main: '#F04438' },
      text: { primary: ink, secondary: muted },
      divider: line,
      action: { hover: d ? 'rgba(255,255,255,0.05)' : 'rgba(16,24,40,0.045)' },
    },
    shape: { borderRadius: 4 },
    typography: {
      fontFamily: '"Geist", "Inter", "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      h1: { fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.05 },
      h2: { fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.1 },
      h3: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15 },
      h4: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h5: { fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.02em' },
      h6: { fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em' },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { backgroundColor: bg, color: ink, minHeight: '100vh' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: panel, backgroundImage: 'none', border: `1px solid ${line}`, borderRadius: 14,
            boxShadow: lift(1), transition: `border-color .2s ${EASE}, box-shadow .25s ${EASE}`, position: 'relative',
            // hairline border light that follows the cursor (--mx/--my set by a global pointer listener)
            '&::after': {
              content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit', padding: '1px', pointerEvents: 'none', opacity: 0, transition: 'opacity .3s',
              background: `radial-gradient(200px circle at var(--mx, 50%) var(--my, 50%), ${d ? 'rgba(120,165,255,0.9)' : 'rgba(37,99,235,0.75)'}, transparent 70%)`,
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude',
            },
            '&:hover::after': { opacity: 1 },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, padding: '7px 16px', '& .MuiButton-startIcon, & .MuiButton-endIcon': { transition: `transform .35s ${EASE}` }, '&:hover .MuiButton-startIcon': { transform: 'translate(2px,-2px) rotate(-10deg)' }, '&:hover .MuiButton-endIcon': { transform: 'translateX(4px)' }, transition: `background-color .15s, border-color .15s, transform .12s ${EASE}`, '&:active': { transform: 'scale(.98)' } },
          containedPrimary: { backgroundColor: '#2563EB', color: '#fff', boxShadow: `inset 0 1px 0 rgba(255,255,255,.18), 0 1px 2px rgba(16,24,40,.2)`, '&:hover': { backgroundColor: '#1D4ED8' } },
          outlined: { color: ink, borderColor: lineStrong, backgroundColor: panel, '&:hover': { borderColor: ink, backgroundColor: panel } },
          text: { '&:hover': { backgroundColor: d ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.05)' } },
          sizeLarge: { padding: '10px 20px', fontSize: '0.95rem' },
        },
      },
      MuiIconButton: { styleOverrides: { root: { transition: `background-color .15s, transform .12s ${EASE}`, '&:active': { transform: 'scale(.94)' } } } },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10, backgroundColor: panel, transition: `box-shadow .2s ${EASE}`,
              '& fieldset': { borderColor: lineStrong, borderWidth: 1 },
              '&:hover fieldset': { borderColor: muted },
              '&.Mui-focused': { boxShadow: `0 0 0 3px ${d ? 'rgba(79,139,255,0.25)' : 'rgba(37,99,235,0.15)'}` },
              '&.Mui-focused fieldset': { borderColor: accent, borderWidth: 1 },
            },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 500, borderRadius: 8 } } },
      MuiTabs: { styleOverrides: { indicator: { height: 2, borderRadius: 2, backgroundColor: accent } } },
      MuiMenu: { styleOverrides: { paper: { backgroundColor: panel, border: `1px solid ${line}`, borderRadius: 12, boxShadow: `0 12px 32px rgba(16,24,40,${d ? '.5' : '.12'})` } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: '#101828', color: '#fff', borderRadius: 8, fontWeight: 500, fontSize: '0.75rem' } } },
      MuiDialog: { styleOverrides: { paper: { backgroundColor: panel, backgroundImage: 'none', border: `1px solid ${line}`, borderRadius: 18, boxShadow: `0 24px 64px rgba(16,24,40,${d ? '.6' : '.18'})` } } },
    },
  });
};

export default getAppTheme('light');
