"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { GlobeIcon, ZapIcon, MoonIcon, SunIcon, PlusIcon, MinimizeIcon } from "./SvgIcons";

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.001;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.005;
      atmosphereRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Earth core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial
          color="#1a3a5c"
          emissive="#0d1f33"
          emissiveIntensity={0.2}
          roughness={0.65}
          metalness={0.35}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.75, 32, 32]} />
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Continent markers (simplified as small dots) */}
      {[
        { lat: 40.7, lon: -74 },   // New York
        { lat: 51.5, lon: -0.1 },  // London
        { lat: 35.7, lon: 139.7 }, // Tokyo
        { lat: -33.9, lon: 18.4 }, // Cape Town
        { lat: -22.9, lon: -43.2 }, // Rio
        { lat: 28.6, lon: 77.2 },  // Delhi
        { lat: 55.8, lon: 37.6 },  // Moscow
        { lat: 1.4, lon: 103.8 },  // Singapore
        { lat: -37.8, lon: 144.9 }, // Melbourne
        { lat: 19.4, lon: -99.1 }, // Mexico City
      ].map((city, i) => {
        const phi = (90 - city.lat) * (Math.PI / 180);
        const theta = (city.lon + 180) * (Math.PI / 180);
        const x = -(1.62 * Math.sin(phi) * Math.cos(theta));
        const z = 1.62 * Math.sin(phi) * Math.sin(theta);
        const y = 1.62 * Math.cos(phi);
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
        );
      })}
    </group>
  );
}

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={orbitRef}>
      <mesh ref={meshRef} position={[3.5, 0.3, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#e8e8e8"
          emissive="#222"
          emissiveIntensity={0.1}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {/* Moon orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.3, 3.35, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#c084fc"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Universe3D() {
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="universe-view">
      <div className="universe-header">
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4, color: "white" }}>
          🌍 The Universe
        </h2>
        <p style={{ fontSize: "0.82rem", opacity: 0.7, color: "white" }}>
          Dal&apos;s world — explore the cosmos
        </p>
      </div>

      <div className="universe-controls">
        <button className="action-btn" onClick={() => setShowLabels(!showLabels)}>
          <GlobeIcon size={14} />
          <span>{showLabels ? "Hide" : "Show"} Labels</span>
        </button>
        <button className="action-btn" onClick={() => setAutoRotate(!autoRotate)}>
          <ZapIcon size={14} />
          <span>{autoRotate ? "Stop" : "Start"} Orbit</span>
        </button>
        <button className="action-btn" onClick={() => setZoomed(!zoomed)}>
          {zoomed ? <MinimizeIcon size={14} /> : <PlusIcon size={14} />}
          <span>{zoomed ? "Zoom Out" : "Zoom In"}</span>
        </button>
      </div>

      <div className="universe-canvas-container">
        <Canvas
          camera={{
            position: zoomed ? [0, 0, 4] : [0, 2.5, 7],
            fov: 55,
            near: 0.1,
            far: 1000,
          }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={["#030308"]} />
          <fog attach="fog" args={["#030308", 15, 40]} />

          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#ffd700" distance={50} />
          <pointLight position={[-10, -5, -10]} intensity={0.8} color="#8b5cf6" distance={50} />
          <pointLight position={[0, -10, 5]} intensity={0.5} color="#00d4ff" distance={30} />

          <Suspense fallback={null}>
            <Earth />
            <Moon />
            <FloatingParticles />
            <Stars
              radius={80}
              depth={60}
              count={8000}
              factor={5}
              saturation={0.4}
              fade
              speed={1.5}
            />
            {showLabels && (
              <>
                <Text
                  position={[0, -2.4, 0]}
                  fontSize={0.25}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  Earth
                </Text>
                <Text
                  position={[3.5, 0.9, 0]}
                  fontSize={0.15}
                  color="#e8e8e8"
                  anchorX="center"
                >
                  Moon
                </Text>
              </>
            )}
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2.5}
            maxDistance={20}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            dampingFactor={0.05}
            enableDamping
          />
        </Canvas>
      </div>

      <div className="universe-actions">
        <button className="action-btn">
          <MoonIcon size={16} />
          <span>Night View</span>
        </button>
        <button className="action-btn">
          <SunIcon size={16} />
          <span>Day View</span>
        </button>
        <button className="action-btn">
          <GlobeIcon size={16} />
          <span>Constellations</span>
        </button>
      </div>
    </div>
  );
}
