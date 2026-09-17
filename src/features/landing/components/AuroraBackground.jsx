import { Box, useTheme } from '@mui/material';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/**
 * Fixed, decorative background layer used behind every landing section.
 * Kept to CSS gradients + a handful of particles (no canvas, no JS loop)
 * so it stays cheap on low-end devices while still feeling premium.
 */
const AuroraBackground = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();

  const particles = Array.from({ length: 14 });

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
          ? 'radial-gradient(circle at 15% 10%, rgba(139,92,246,0.16), transparent 45%), radial-gradient(circle at 85% 25%, rgba(217,70,239,0.14), transparent 45%), radial-gradient(circle at 50% 90%, rgba(34,211,238,0.08), transparent 50%), #05060d'
          : 'radial-gradient(circle at 15% 10%, rgba(139,92,246,0.10), transparent 45%), radial-gradient(circle at 85% 20%, rgba(217,70,239,0.09), transparent 45%), radial-gradient(circle at 50% 95%, rgba(34,211,238,0.06), transparent 50%), #FBFAFF',
      }}
    >
      {/* Subtle grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: isDark ? 0.12 : 0.06,
          backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
        }}
      />

      {/* Animated gradient blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-8%',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(217,70,239,0.15))',
          filter: 'blur(90px)',
          animation: reduced ? 'none' : 'auroraDrift1 22s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          right: '-10%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34,211,238,0.22), rgba(139,92,246,0.12))',
          filter: 'blur(100px)',
          animation: reduced ? 'none' : 'auroraDrift2 26s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '25%',
          width: 560,
          height: 400,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(217,70,239,0.2), rgba(34,211,238,0.1))',
          filter: 'blur(110px)',
          animation: reduced ? 'none' : 'auroraDrift3 30s ease-in-out infinite',
        }}
      />

      {!reduced &&
        particles.map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              borderRadius: '50%',
              background: i % 2 === 0 ? '#D946EF' : '#22D3EE',
              opacity: 0.35,
              animation: `particleFloat ${10 + (i % 6)}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}

      <style>{`
        @keyframes auroraDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes auroraDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.1); }
        }
        @keyframes auroraDrift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.05); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.15; }
          50% { transform: translateY(-24px) translateX(10px); opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};

export default AuroraBackground;
