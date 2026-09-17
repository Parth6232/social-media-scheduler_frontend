import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const glossy = (color, extra = {}) => ({
  color,
  metalness: 0.35,
  roughness: 0.18,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  ...extra,
});

/** Small glowing data-node that orbits the core, representing a scheduled post / analytics ping. */
const OrbitNode = ({ radius, speed, offset, color, y = 0, size = 0.14, reduced }) => {
  const ref = useRef(null);
  useFrame(({ clock }) => {
    const t = reduced ? offset : clock.getElapsedTime() * speed + offset;
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * radius, y + Math.sin(t * 1.3) * 0.15, Math.sin(t) * radius);
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[size, 0]} />
      <meshPhysicalMaterial {...glossy(color, { emissive: color, emissiveIntensity: 0.6, roughness: 0.2 })} />
    </mesh>
  );
};

const BotCore = ({ reduced }) => {
  const group = useRef(null);
  const headRef = useRef(null);
  const ringRef = useRef(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reduced) {
      group.current.rotation.y += delta * 0.18;
      if (ringRef.current) ringRef.current.rotation.z += delta * 0.35;
    }
    // gentle mouse-parallax tilt (subtle, never disorienting)
    const targetX = reduced ? 0 : state.pointer.y * 0.15;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04);
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, state.pointer.x * 0.3, 0.05);
    }
  });

  return (
    <group ref={group}>
      {/* Head / visor */}
      <group ref={headRef} position={[0, 1.05, 0]}>
        <mesh>
          <sphereGeometry args={[0.55, 48, 48]} />
          <meshPhysicalMaterial {...glossy('#f5f3ff', { transmission: 0.55, thickness: 0.6, ior: 1.3, roughness: 0.05 })} />
        </mesh>
        <mesh position={[0, -0.02, 0.48]}>
          <boxGeometry args={[0.62, 0.16, 0.12]} />
          <meshPhysicalMaterial {...glossy('#22D3EE', { emissive: '#22D3EE', emissiveIntensity: 1.4, roughness: 0.15 })} />
        </mesh>
      </group>

      {/* Torso */}
      <RoundedBox args={[0.95, 1.05, 0.6]} radius={0.22} smoothness={6} position={[0, 0.05, 0]}>
        <meshPhysicalMaterial {...glossy('#8B5CF6', { transmission: 0.08, roughness: 0.22 })} />
      </RoundedBox>

      {/* Chest emblem */}
      <mesh position={[0, 0.15, 0.32]}>
        <torusGeometry args={[0.16, 0.045, 24, 48]} />
        <meshPhysicalMaterial {...glossy('#E879F9', { emissive: '#D946EF', emissiveIntensity: 0.9 })} />
      </mesh>

      {/* Shoulders */}
      {[-0.68, 0.68].map((x) => (
        <mesh key={x} position={[x, 0.4, 0]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshPhysicalMaterial {...glossy('#C4B5FD')} />
        </mesh>
      ))}

      {/* Automation halo ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.55, 0.02, 16, 100]} />
        <meshPhysicalMaterial {...glossy('#67E8F9', { emissive: '#22D3EE', emissiveIntensity: 1.1 })} />
      </mesh>

      {/* Orbiting data nodes */}
      <OrbitNode radius={1.55} speed={0.35} offset={0} color="#22D3EE" y={0.1} reduced={reduced} />
      <OrbitNode radius={1.55} speed={0.35} offset={2.1} color="#D946EF" y={-0.1} reduced={reduced} />
      <OrbitNode radius={1.55} speed={0.35} offset={4.2} color="#A78BFA" y={0.2} reduced={reduced} />
    </group>
  );
};

/**
 * Self-contained, lightweight 3D hero visual: a glossy "AI automation core" that
 * floats, slowly rotates and gently reacts to the cursor. Deliberately avoids
 * heavy assets, postprocessing bloom and unbounded particle counts to stay fast.
 */
const HeroBot3D = ({ className }) => {
  const reduced = usePrefersReducedMotion();
  const dpr = useMemo(() => (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1), []);

  return (
    <div className={className} style={{ width: '100%', height: '100%', minHeight: 360 }}>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0.6, 5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: 'pan-y' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 4]} intensity={1.1} color="#ffffff" />
        <pointLight position={[-3, -1, -2]} intensity={18} color="#D946EF" />
        <pointLight position={[3, 2, -1]} intensity={14} color="#22D3EE" />

        <Suspense fallback={null}>
          <Float speed={reduced ? 0 : 1.4} rotationIntensity={reduced ? 0 : 0.25} floatIntensity={reduced ? 0 : 0.7}>
            <BotCore reduced={reduced} />
          </Float>
          <ContactShadows position={[0, -1.15, 0]} opacity={0.35} scale={6} blur={2.4} far={2} color="#4C1D95" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroBot3D;
