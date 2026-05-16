"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";

/* ─── Texture paths (your self-hosted PNGs) ─── */
const TEX = {
  day:     "/textures/earth-day.png",
  night:   "/textures/earth-night.png",
  cloud:   "/textures/earth-clouds.png",
  bump:    "/textures/earth-bump.png",      // optional — if you have it
  moon:    "/textures/moon.png",
  stars:   "/textures/stars.png",
};

/* ─── Earth ─── */
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const [dayMap, nightMap, cloudMap, bumpMap] = useLoader(
    THREE.TextureLoader,
    [TEX.day, TEX.night, TEX.cloud, TEX.bump].filter((t): t is string => Boolean(t))
  );

  // Fix texture orientation
  [dayMap, nightMap, cloudMap, bumpMap].forEach((t) => {
    if (t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; }
  });

  useFrame(({ clock }) => {
    if (earthRef.current) earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    if (cloudRef.current) cloudRef.current.rotation.y = clock.getElapsedTime() * 0.07;
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          emissiveMap={nightMap}
          emissive={new THREE.Color(0xffffff)}
          emissiveIntensity={0.6}
          bumpMap={bumpMap || undefined}
          bumpScale={0.05}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Cloud layer (slightly larger, transparent) */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[2.04, 64, 64]} />
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial
          color={new THREE.Color(0x3a9bdc)}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Moon ─── */
function Moon() {
  const moonRef = useRef<THREE.Group>(null);
  const moonTexture = useLoader(THREE.TextureLoader, TEX.moon);
  if (moonTexture) moonTexture.colorSpace = THREE.SRGBColorSpace;

  useFrame(({ clock }) => {
    if (!moonRef.current) return;
    const t = clock.getElapsedTime() * 0.2;
    moonRef.current.position.x = Math.cos(t) * 6;
    moonRef.current.position.z = Math.sin(t) * 6;
    moonRef.current.rotation.y += 0.002;
  });

  return (
    <group ref={moonRef}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial map={moonTexture} roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ─── Starfield background ─── */
function StarField() {
  const starTex = useLoader(THREE.TextureLoader, TEX.stars);
  if (starTex) starTex.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh>
      <sphereGeometry args={[50, 32, 32]} />
      <meshBasicMaterial
        map={starTex}
        side={THREE.BackSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

/* ─── Sun light helper ─── */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[10, 5, 8]}
        intensity={2.5}
        color={new THREE.Color(0xfff5e6)}
        castShadow
      />
      <pointLight position={[-10, -5, -8]} intensity={0.5} color={new THREE.Color(0x4444ff)} />
    </>
  );
}

/* ─── Loading spinner ─── */
function Loader() {
  return (
    <Html center>
      <div style={{
        color: "#fff",
        fontFamily: "sans-serif",
        textAlign: "center",
        backdropFilter: "blur(10px)",
        background: "rgba(0,0,0,0.4)",
        padding: "20px 30px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🌍</div>
        <div>Loading textures...</div>
      </div>
    </Html>
  );
}

/* ─── Main exported component ─── */
export default function Universe3D() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<Loader />}>
          <Lighting />
          <Earth />
          <Moon />
          <StarField />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3.5}
            maxDistance={15}
            autoRotate
            autoRotateSpeed={0.8}
            rotateSpeed={0.6}
            zoomSpeed={0.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
