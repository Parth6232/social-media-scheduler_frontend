import React, { useRef } from 'react';
import { Card, useTheme } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

/**
 * Glassmorphic card with:
 *  - Theme-aware glass styling (dark / light)
 *  - Mouse-tracking 3D tilt + specular glare when hoverEffect=true
 *  - Optional `tilt={false}` to keep lift/glow but skip the rotation
 *  - No tilt when reduced-motion is detected
 *
 * Pass `authCard` to use a slightly wider border + stronger shadow suitable
 * for centered auth forms.
 */
const GlassCard = ({ children, sx = {}, hoverEffect = false, tilt = true, authCard = false, ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardRef = useRef(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 260, damping: 24, mass: 0.4 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 260, damping: 24, mass: 0.4 });

  const glareX = useTransform(px, [0, 1], ['0%', '100%']);
  const glareY = useTransform(py, [0, 1], ['0%', '100%']);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.14), transparent 55%)`;

  const baseSx = {
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    backgroundColor: isDark
      ? 'rgba(10, 14, 30, 0.52)'
      : 'rgba(255, 255, 255, 0.72)',
    border: isDark
      ? authCard
        ? '1px solid rgba(139,92,246,0.18)'
        : '1px solid rgba(255, 255, 255, 0.07)'
      : authCard
        ? '1px solid rgba(139,92,246,0.15)'
        : '1px solid rgba(0, 0, 0, 0.07)',
    borderRadius: '24px',
    boxShadow: isDark
      ? authCard
        ? '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
        : '0 12px 40px rgba(0, 0, 0, 0.4)'
      : authCard
        ? '0 20px 60px rgba(139,92,246,0.10), 0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)'
        : '0 4px 20px rgba(0, 0, 0, 0.05)',
    backgroundImage: isDark
      ? 'linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0))'
      : 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
    ...sx,
  };

  const handleMouseMove = (e) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  if (hoverEffect) {
    return (
      <Card
        ref={cardRef}
        component={motion.div}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{
          y: -6,
          scale: 1.012,
          boxShadow: isDark
            ? '0 28px 64px rgba(139, 58, 237, 0.26)'
            : '0 24px 52px rgba(139,92,246,0.18)',
          borderColor: isDark
            ? 'rgba(139, 58, 237, 0.38)'
            : 'rgba(139,92,246,0.28)',
        }}
        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        style={
          tilt
            ? { rotateX, rotateY, transformPerspective: 1000, willChange: 'transform' }
            : undefined
        }
        sx={baseSx}
        {...props}
      >
        {children}
        {tilt && (
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: glareBg,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              zIndex: 2,
            }}
          />
        )}
      </Card>
    );
  }

  return (
    <Card ref={cardRef} sx={baseSx} {...props}>
      {children}
    </Card>
  );
};

export default GlassCard;
