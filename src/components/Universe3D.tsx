"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Sky, Html } from "@react-three/drei";
import * as THREE from "three";

// ----------------------------------------------------------------------
// Helper: convert lat/lon to Vector3 on sphere of radius 1
// ----------------------------------------------------------------------
function latLonToVector3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = lon * Math.PI / 180;
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// ----------------------------------------------------------------------
// Procedural city cluster (buildings)
// ----------------------------------------------------------------------
function CityCluster({ lat, lon, count = 40 }: { lat: number; lon: number; count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const center = latLonToVector3(lat, lon, 1.005); // just above surface
  
  useEffect(() => {
    if (!groupRef.current) return;
    // Clear existing
    while (groupRef.current.children.length) {
      groupRef.current.remove(groupRef.current.children[0]);
    }
    // Generate buildings
    for (let i = 0; i < count; i++) {
      // Random offset in tangent plane
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.03;
      const dx = Math.cos(angle) * dist;
      const dz = Math.sin(angle) * dist;
      // Project onto sphere surface
      const pos = center.clone().add(new THREE.Vector3(dx, 0, dz)).normalize().multiplyScalar(1.005);
      const height = 0.003 + Math.random() * 0.012;
      const width = 0.0015 + Math.random() * 0.003;
      const depth = 0.0015 + Math.random() * 0.003;
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.1 + Math.random() * 0.1, 0.7, 0.5),
        emissive: new THREE.Color().setHSL(0.1, 0.5, 0.1),
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.copy(pos);
      groupRef.current.add(cube);
    }
  }, [lat, lon, count]);
  
  return <group ref={groupRef} />;
}

// ----------------------------------------------------------------------
// Earth sphere with texture and interactive picking
// ----------------------------------------------------------------------
function Earth({ onClickCountry }: { onClickCountry: (country: string, lat: number, lon: number) => void }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster } = useThree();
  const [hovered, setHovered] = useState(false);
  
  // Sample countries data (in real app, load from GeoJSON)
  const countries = [
    { name: "Kenya", lat: -1.286389, lon: 36.817223 },
    { name: "United States", lat: 37.09024, lon: -95.712891 },
    { name: "Japan", lat: 36.204824, lon: 138.252924 },
    { name: "France", lat: 46.603354, lon: 1.888334 },
    { name: "Brazil", lat: -14.235004, lon: -51.92528 },
    { name: "India", lat: 20.593684, lon: 78.96288 },
    { name: "Australia", lat: -25.274398, lon: 133.775136 },
    { name: "South Africa", lat: -30.559482, lon: 22.937506 },
    { name: "China", lat: 35.86166, lon: 104.195397 },
    { name: "Germany", lat: 51.165691, lon: 10.451526 },
  ];
  
  const handleClick = (event: any) => {
    if (!earthRef.current) return;
    const intersects = raycaster.intersectObject(earthRef.current);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      // Convert point to lat/lon
      const phi = Math.acos(point.y / 1.01);
      const theta = Math.atan2(point.z, point.x);
      const lat = 90 - (phi * 180 / Math.PI);
      const lon = theta * 180 / Math.PI;
      // Find nearest country by min distance
      let nearest = "";
      let minDist = 20;
      for (const c of countries) {
        const d = Math.hypot(lat - c.lat, lon - c.lon);
        if (d < minDist) {
          minDist = d;
          nearest = c.name;
        }
      }
      if (nearest && minDist < 10) {
        onClickCountry(nearest, lat, lon);
      } else {
        onClickCountry("Ocean", lat, lon);
      }
    }
  };
  
  // Load high-res earth texture (public domain from threejs examples)
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    new THREE.TextureLoader().load(
      "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
      (tex) => setTexture(tex)
    );
  }, []);
  
  return (
    <mesh ref={earthRef} onClick={handleClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <sphereGeometry args={[1, 128, 128]} />
      {texture && <meshStandardMaterial map={texture} roughness={0.5} metalness={0.1} />}
      {hovered && <Html position={[1.2, 0, 0]}><div style={{ background: 'black', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>Click to select country</div></Html>}
    </mesh>
  );
}

// ----------------------------------------------------------------------
// Day-Night cycle: sun light and sky
// ----------------------------------------------------------------------
function SunLight({ timeOfDay }: { timeOfDay: number }) {
  // timeOfDay: 0-1 (0 = midnight, 0.5 = noon)
  const angle = (timeOfDay - 0.25) * Math.PI * 2; // 0.25 = 6am
  const sunPos = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(5);
  const intensity = Math.max(0, Math.sin(angle + Math.PI/2)) * 1.2;
  return (
    <>
      <ambientLight intensity={0.2 + (1 - intensity) * 0.3} />
      <directionalLight position={sunPos} intensity={intensity} color="#fff5e0" castShadow />
      <pointLight position={[0, 0, 2]} intensity={0.2 * (1 - intensity)} color="#4a6a8a" />
    </>
  );
}

// ----------------------------------------------------------------------
// City lights on night side (emissive texture)
// ----------------------------------------------------------------------
function CityLights() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    new THREE.TextureLoader().load(
      "https://threejs.org/examples/textures/planets/earth_nightmap_2048.jpg",
      (tex) => setTexture(tex)
    );
  }, []);
  return (
    <mesh>
      <sphereGeometry args={[1.005, 128, 128]} />
      {texture && <meshStandardMaterial map={texture} emissive="#334" emissiveIntensity={0.8} transparent />}
    </mesh>
  );
}

// ----------------------------------------------------------------------
// Main 3D Universe Component
// ----------------------------------------------------------------------
export default function Universe3D() {
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [timeOfDay, setTimeOfDay] = useState(0.5);
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);
  
  // Sync time with real UTC hour
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
      setTimeOfDay(hours / 24);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const handleCountryClick = (name: string, lat: number, lon: number) => {
    setSelectedCountry({ name, lat, lon });
    // Optional: fly camera to that location (implement via ref to OrbitControls)
  };
  
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#000" }}>
      <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }} dpr={[1, 2]}>
        <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={0.5} />
        <SunLight timeOfDay={timeOfDay} />
        <Sky distance={450000} sunPosition={[Math.cos(timeOfDay * Math.PI * 2 - Math.PI/2), Math.sin(timeOfDay * Math.PI * 2 - Math.PI/2), 0]} />
        <Earth onClickCountry={handleCountryClick} />
        <CityLights />
        {/* Add major cities as clusters */}
        <CityCluster lat={-1.286} lon={36.817} count={60} />
        <CityCluster lat={40.712} lon={-74.006} count={120} />
        <CityCluster lat={35.689} lon={139.692} count={100} />
        <CityCluster lat={48.856} lon={2.352} count={90} />
        <CityCluster lat={-23.55} lon={-46.633} count={80} />
        <CityCluster lat={28.613} lon={77.209} count={110} />
        <CityCluster lat={-33.868} lon={151.209} count={70} />
        <CityCluster lat={51.507} lon={-0.127} count={95} />
        <OrbitControls
          enableZoom
          enablePan
          autoRotate
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
          zoomSpeed={1.2}
        />
      </Canvas>
      {selectedCountry && (
        <div style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(12px)",
          padding: "12px 20px",
          borderRadius: 32,
          color: "white",
          border: "1px solid rgba(255,255,255,0.2)",
          zIndex: 10,
        }}>
          <strong>📍 {selectedCountry.name}</strong>
          <button
            onClick={() => setSelectedCountry(null)}
            style={{ marginLeft: 16, background: "none", border: "none", color: "#ff6b9d", cursor: "pointer" }}
          >
            Close ✕
          </button>
        </div>
      )}
    </div>
  );
}
