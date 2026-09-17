import { Box, useTheme } from '@mui/material';
import usePrefersReducedMotion from '../../../features/landing/hooks/usePrefersReducedMotion';

/**
 * CSS-only aurora background for auth pages.
 * Mirrors the landing page AuroraBackground (no WebGL) for visual continuity:
 * - Animated gradient blobs (violet → fuchsia, cyan as accent)
 * - Subtle grid overlay
 * - Floating particles
 * - Fully respects prefers-reduced-motion
 * - Dark / light mode aware via MUI theme
 */
const AuthBackground = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();

  const particles = Array.from({ length: 12 });

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: isDark
          ? 'radial-gradient(circle at 15% 10%, rgba(139,92,246,0.18), transparent 45%), radial-gradient(circle at 85% 25%, rgba(217,70,239,0.15), transparent 45%), radial-gradient(circle at 50% 90%, rgba(34,211,238,0.08), transparent 50%), #05060d'
          : 'radial-gradient(circle at 15% 10%, rgba(139,92,246,0.11), transparent 45%), radial-gradient(circle at 85% 20%, rgba(217,70,239,0.09), transparent 45%), radial-gradient(circle at 50% 95%, rgba(34,211,238,0.06), transparent 50%), #FBFAFF',
      }}
    >
      {/* Subtle grid overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: isDark ? 0.10 : 0.05,
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'} 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
        }}
      />

      {/* Blob 1 — top-left, violet */}
      <Box
        sx={{
          position: 'absolute',
          top: '-12%',
          left: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.38), rgba(217,70,239,0.16))',
          filter: 'blur(88px)',
          animation: reduced ? 'none' : 'authDrift1 22s ease-in-out infinite',
        }}
      />

      {/* Blob 2 — right, cyan → violet */}
      <Box
        sx={{
          position: 'absolute',
          top: '35%',
          right: '-12%',
          width: 460,
          height: 460,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(139,92,246,0.12))',
          filter: 'blur(100px)',
          animation: reduced ? 'none' : 'authDrift2 26s ease-in-out infinite',
        }}
      />

      {/* Blob 3 — bottom-center, fuchsia → cyan */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-18%',
          left: '22%',
          width: 540,
          height: 400,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(217,70,239,0.2), rgba(34,211,238,0.1))',
          filter: 'blur(110px)',
          animation: reduced ? 'none' : 'authDrift3 30s ease-in-out infinite',
        }}
      />

      {/* Floating particles */}
      {!reduced &&
        particles.map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${(i * 41 + 5) % 95}%`,
              left: `${(i * 57 + 3) % 95}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              borderRadius: '50%',
              background: i % 3 === 0 ? '#D946EF' : i % 3 === 1 ? '#22D3EE' : '#A78BFA',
              opacity: 0.3,
              animation: `authParticle ${9 + (i % 7)}s ease-in-out ${i * 0.5}s infinite`,
            }}
          />
        ))}

      <style>{`
        @keyframes authDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(36px, 28px) scale(1.08); }
        }
        @keyframes authDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-28px, 36px) scale(1.1); }
        }
        @keyframes authDrift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(18px, -26px) scale(1.05); }
        }
        @keyframes authParticle {
          0%, 100% { transform: translateY(0) translateX(0);   opacity: 0.12; }
          50%       { transform: translateY(-22px) translateX(8px); opacity: 0.45; }
        }
      `}</style>
    </Box>
  );
};

export default AuthBackground;
