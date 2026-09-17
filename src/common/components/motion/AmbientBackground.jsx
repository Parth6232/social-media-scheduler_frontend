import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Octahedron, Float, Environment } from '@react-three/drei';

/** Wraps all shapes in a slow, continuous auto-rotation so the whole
 *  ambient scene feels alive even before the user moves the mouse. */
const SlowSpin = ({ children, speed = 0.02 }) => {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed) * 0.25;
    groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.12;
  });
  return <group ref={groupRef}>{children}</group>;
};

const AbstractShape1 = ({ position, color, scale = 1 }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.4}>
      <Icosahedron ref={meshRef} args={[1, 0]} position={position} scale={scale}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.5}
          thickness={0.5}
        />
      </Icosahedron>
    </Float>
  );
};

const AbstractShape2 = ({ position, color, scale }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.08;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.1}>
      <Octahedron ref={meshRef} args={[1, 0]} position={position} scale={scale}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          metalness={0.5}
          transmission={0.7}
          opacity={0.8}
          transparent
        />
      </Octahedron>
    </Float>
  );
};

/** Returns true once the viewport is below `breakpoint` px. Used to skip the
 *  WebGL canvas entirely on phones so we don't burn battery/GPU there. */
const useIsSmallScreen = (breakpoint = 768) => {
  const [isSmall, setIsSmall] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isSmall;
};

/**
 * Floating 3D ambient background — tucked into the corners and heavily
 * blurred so it reads as a soft ambient glow behind the UI, never as sharp
 * shapes floating on top of text/cards.
 *
 * variant="full"   -> hero/auth pages: 4 corner blobs, moderate blur
 * variant="subtle" -> persistent app shell: 2 far-corner blobs, heavier
 *                     blur + lower opacity so it never fights with content
 */
const AmbientBackground = ({ variant = 'full', fixed = false }) => {
  const isSmallScreen = useIsSmallScreen();
  const isSubtle = variant === 'subtle';

  // Skip WebGL entirely on small screens — keeps mobile smooth and battery-friendly.
  if (isSmallScreen) return null;

  return (
    <div
      style={{
        position: fixed ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: isSubtle ? 0.4 : 0.9,
        filter: isSubtle ? 'blur(38px)' : 'blur(18px)',
        transform: 'scale(1.15)', // hide blurred edge clipping at viewport border
      }}
    >
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#7C3AED" />

        {/* Shapes pushed into the far corners, well away from center content */}
        <SlowSpin>
          <AbstractShape1 position={[-7, 4, -6]} color="#7C3AED" scale={1.6} />
          <AbstractShape2 position={[7, -4, -7]} color="#2563EB" scale={2} />
          {!isSubtle && (
            <>
              <AbstractShape1 position={[-6.5, -4.5, -8]} color="#A78BFA" scale={1.3} />
              <AbstractShape2 position={[7, 4.5, -7]} color="#5B21B6" scale={1.4} />
            </>
          )}
          {isSubtle && (
            <AbstractShape2 position={[0, 6.5, -9]} color="#A78BFA" scale={1.1} />
          )}
        </SlowSpin>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default AmbientBackground;
