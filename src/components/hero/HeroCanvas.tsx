"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

/* ---- Floating particle field ------------------------------------- */
function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    // Seeded PRNG rather than Math.random: the field must stay identical
    // across re-renders, or the stars visibly reshuffle.
    let seed = 0x9e3779b9;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute on a rough spherical shell for depth
      const r = 4 + rand() * 6;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.03;
    ref.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        color="#a78bfa"
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

/* ---- Central distorted crystal ----------------------------------- */
function Crystal(props: ThreeElements["group"]) {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  // Gentle pointer parallax + counter-rotating shells for depth
  useFrame((state, delta) => {
    if (group.current) {
      const targetX = state.pointer.y * 0.25;
      const targetY = state.pointer.x * 0.35;
      group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05;
    }
    if (halo.current) halo.current.rotation.y -= delta * 0.12;
    if (ring.current) {
      ring.current.rotation.z += delta * 0.08;
      ring.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <group ref={group} {...props}>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
        {/* Core. Low metalness on purpose: there's no environment map to
            reflect, and a high-metal surface renders as a flat dark blob. */}
        <Icosahedron args={[1.25, 6]}>
          <MeshDistortMaterial
            color="#5b21b6"
            emissive="#4c1d95"
            emissiveIntensity={0.25}
            roughness={0.32}
            metalness={0.18}
            distort={0.4}
            speed={1.5}
          />
        </Icosahedron>

        {/* Faceted wireframe shell, hugging the core */}
        <Icosahedron ref={halo} args={[1.46, 1]}>
          <meshBasicMaterial
            color="#22d3ee"
            wireframe
            transparent
            opacity={0.18}
          />
        </Icosahedron>

        {/* Thin orbiting ring */}
        <mesh ref={ring} rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[1.9, 0.01, 8, 128]} />
          <meshBasicMaterial color="#f472b6" transparent opacity={0.28} />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroCanvas() {
  // This component is client-only (dynamic import with ssr:false), so `window`
  // is safe to read while picking the initial particle budget.
  const [count] = useState(() =>
    window.matchMedia("(max-width: 768px)").matches ? 250 : 700,
  );

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color="#c4b5fd" />
      {/* Cyan rim from behind-left, pink kicker from below-right — the two
          highlights are what make the core read as glass rather than a blob. */}
      <pointLight position={[-4, -2, -3]} intensity={3.2} color="#22d3ee" />
      <pointLight position={[3, -3, 2]} intensity={1.8} color="#f472b6" />
      {/* Scaled down so the crystal reads as a jewel beside the headline,
          not a planet behind it. */}
      <Crystal position={[0, 0, 0]} scale={0.72} />
      <Particles count={count} />
    </Canvas>
  );
}
