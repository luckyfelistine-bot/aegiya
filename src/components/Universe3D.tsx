"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   BYEOL UNIVERSE 3D v6.0 — For Dal 💕
   Real textures. Real arcs. Real sky. Clean screen. Living world.
   ═══════════════════════════════════════════════════════════════ */

/* ─── TYPES ─── */
interface CityData { name: string; lat: number; lon: number; country: string; flag: string; }
interface ArcData { startLat: number; startLon: number; endLat: number; endLon: number; color: string; label?: string; }
interface ZoomConfig { name: string; cameraPos: [number, number, number]; minD: number; maxD: number; fov: number; showCities: boolean; showClouds: boolean; showBoundaries: boolean; showNairobi: boolean; showFamily: boolean; showArcs: boolean; }
interface Settings { dayNightShader: boolean; cityLights: boolean; clouds: boolean; atmosphere: boolean; autoReturn: boolean; labels: boolean; timeInfo: boolean; sunMoonInfo: boolean; arcs: boolean; }

/* ─── CONSTANTS ─── */
const NAIROBI = { lat: -1.286389, lon: 36.817223 };
const EARTH_RADIUS = 2.0;
const ATMOSPHERE_RADIUS = 2.08;
const CLOUD_RADIUS = 2.04;
const MOON_DISTANCE = 7.0;
const SUN_DISTANCE = 50.0;

const ZOOM_LEVELS: ZoomConfig[] = [
  { name: "Solar System", cameraPos: [0, 5, 18], minD: 8, maxD: 40, fov: 55, showCities: false, showClouds: false, showBoundaries: false, showNairobi: false, showFamily: false, showArcs: true },
  { name: "Earth & Moon", cameraPos: [0, 3, 10], minD: 5, maxD: 15, fov: 50, showCities: false, showClouds: true, showBoundaries: false, showNairobi: false, showFamily: false, showArcs: true },
  { name: "Cities", cameraPos: [0, 1.5, 5.5], minD: 3, maxD: 9, fov: 45, showCities: true, showClouds: true, showBoundaries: true, showNairobi: false, showFamily: false, showArcs: false },
  { name: "Family", cameraPos: [0.2, 0.4, 3.5], minD: 2.2, maxD: 5, fov: 40, showCities: true, showClouds: false, showBoundaries: false, showNairobi: true, showFamily: true, showArcs: false },
];

const CITIES: CityData[] = [
  { name: "Nairobi", lat: -1.286389, lon: 36.817223, country: "Kenya", flag: "🇰🇪" },
  { name: "Mombasa", lat: -4.043477, lon: 39.668202, country: "Kenya", flag: "🇰🇪" },
  { name: "Kisumu", lat: -0.102222, lon: 34.761667, country: "Kenya", flag: "🇰🇪" },
  { name: "London", lat: 51.507351, lon: -0.127758, country: "UK", flag: "🇬🇧" },
  { name: "New York", lat: 40.712776, lon: -74.005974, country: "USA", flag: "🇺🇸" },
  { name: "Tokyo", lat: 35.676192, lon: 139.650311, country: "Japan", flag: "🇯🇵" },
  { name: "Paris", lat: 48.856613, lon: 2.352222, country: "France", flag: "🇫🇷" },
  { name: "Dubai", lat: 25.276987, lon: 55.296249, country: "UAE", flag: "🇦🇪" },
  { name: "Sydney", lat: -33.86882, lon: 151.209296, country: "Australia", flag: "🇦🇺" },
  { name: "Rio", lat: -22.906847, lon: -43.172897, country: "Brazil", flag: "🇧🇷" },
  { name: "Cairo", lat: 30.04442, lon: 31.235712, country: "Egypt", flag: "🇪🇬" },
  { name: "Lagos", lat: 6.524379, lon: 3.379206, country: "Nigeria", flag: "🇳🇬" },
  { name: "Mumbai", lat: 19.075984, lon: 72.877656, country: "India", flag: "🇮🇳" },
  { name: "Singapore", lat: 1.352083, lon: 103.819836, country: "Singapore", flag: "🇸🇬" },
  { name: "Cape Town", lat: -33.924869, lon: 18.424055, country: "South Africa", flag: "🇿🇦" },
  { name: "Moscow", lat: 55.755826, lon: 37.6173, country: "Russia", flag: "🇷🇺" },
  { name: "Beijing", lat: 39.904202, lon: 116.407394, country: "China", flag: "🇨🇳" },
  { name: "Los Angeles", lat: 34.052234, lon: -118.243685, country: "USA", flag: "🇺🇸" },
  { name: "Mexico City", lat: 19.432608, lon: -99.133209, country: "Mexico", flag: "🇲🇽" },
  { name: "Istanbul", lat: 41.008238, lon: 28.978359, country: "Turkey", flag: "🇹🇷" },
  { name: "Seoul", lat: 37.566535, lon: 126.977969, country: "South Korea", flag: "🇰🇷" },
  { name: "Bangkok", lat: 13.756331, lon: 100.501765, country: "Thailand", flag: "🇹🇭" },
  { name: "Johannesburg", lat: -26.204103, lon: 28.047305, country: "South Africa", flag: "🇿🇦" },
  { name: "Lima", lat: -12.046374, lon: -77.042793, country: "Peru", flag: "🇵🇪" },
  { name: "Jakarta", lat: -6.208763, lon: 106.845599, country: "Indonesia", flag: "🇮🇩" },
];

/* Romantic arcs — Our Journey paths from Nairobi */
const ARCS: ArcData[] = [
  { startLat: NAIROBI.lat, startLon: NAIROBI.lon, endLat: 51.507351, endLon: -0.127758, color: "#c084fc", label: "Our Journey to London" },
  { startLat: NAIROBI.lat, startLon: NAIROBI.lon, endLat: 48.856613, endLon: 2.352222, color: "#ff6b9d", label: "Our Journey to Paris" },
  { startLat: NAIROBI.lat, startLon: NAIROBI.lon, endLat: 25.276987, endLon: 55.296249, color: "#00d4ff", label: "Our Journey to Dubai" },
  { startLat: NAIROBI.lat, startLon: NAIROBI.lon, endLat: 40.712776, endLon: -74.005974, color: "#ffd700", label: "Our Journey to New York" },
  { startLat: NAIROBI.lat, startLon: NAIROBI.lon, endLat: 35.676192, endLon: 139.650311, color: "#f472b6", label: "Our Journey to Tokyo" },
];

/* ─── TEXTURE URLs (Wikimedia Commons — Solar System Scope, CC-BY, NASA-based) ─── */
const TEX = {
  day: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Solarsystemscope_texture_2k_earth_daymap.jpg",
  night: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Solarsystemscope_texture_2k_earth_nightmap.jpg",
  cloud: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Solarsystemscope_texture_2k_earth_clouds.jpg",
  moon: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Solarsystemscope_texture_2k_moon.jpg",
  stars: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Solarsystemscope_texture_2k_stars.jpg",
  milkyway: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Solarsystemscope_texture_2k_stars_milky_way.jpg",
};

/* ─── UTILITIES ─── */
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function getKenyaTime(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));
}

function getSunDirection(date: Date): THREE.Vector3 {
  const J2000 = 2451545.0;
  const jd = date.getTime() / 86400000.0 + 2440587.5;
  const n = jd - J2000;
  const L = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360 + 360) % 360;
  const gRad = THREE.MathUtils.degToRad(g);
  const lambda = ((L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad)) % 360 + 360) % 360;
  const lambdaRad = THREE.MathUtils.degToRad(lambda);
  const epsilon = 23.439 * Math.PI / 180;
  const x = Math.cos(lambdaRad);
  const y = Math.sin(lambdaRad) * Math.sin(epsilon);
  const z = Math.sin(lambdaRad) * Math.cos(epsilon);
  return new THREE.Vector3(x, y, z).normalize();
}

function getSunAltitudeAzimuth(date: Date, lat: number, lon: number) {
  const sunDir = getSunDirection(date);
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  const localUp = new THREE.Vector3(
    Math.cos(latRad) * Math.cos(lonRad),
    Math.sin(latRad),
    Math.cos(latRad) * Math.sin(lonRad)
  );
  const localEast = new THREE.Vector3(-Math.sin(lonRad), 0, Math.cos(lonRad));
  const localNorth = new THREE.Vector3(-Math.sin(latRad) * Math.cos(lonRad), Math.cos(latRad), -Math.sin(latRad) * Math.sin(lonRad));
  const alt = Math.asin(Math.max(-1, Math.min(1, sunDir.dot(localUp))));
  const proj = new THREE.Vector3().copy(sunDir).sub(localUp.clone().multiplyScalar(sunDir.dot(localUp)));
  let az = Math.atan2(proj.dot(localEast), proj.dot(localNorth));
  if (az < 0) az += Math.PI * 2;
  return { altitude: THREE.MathUtils.radToDeg(alt), azimuth: THREE.MathUtils.radToDeg(az) };
}

function getMoonPosition(date: Date): THREE.Vector3 {
  const jd = date.getTime() / 86400000.0 + 2440587.5;
  const n = jd - 2451545.0;
  const L = ((218.316 + 13.176396 * n) % 360 + 360) % 360;
  const M = ((134.963 + 13.064993 * n) % 360 + 360) % 360;
  const MRad = THREE.MathUtils.degToRad(M);
  const C = 6.289 * Math.sin(MRad);
  const lambda = ((L + C) % 360 + 360) % 360;
  const lambdaRad = THREE.MathUtils.degToRad(lambda);
  const omega = ((125.045 - 0.0529921 * n) % 360 + 360) % 360;
  const omegaRad = THREE.MathUtils.degToRad(omega);
  const i = 5.145 * Math.PI / 180;
  const dist = MOON_DISTANCE;
  const xOrb = dist * Math.cos(lambdaRad - omegaRad);
  const yOrb = dist * Math.sin(lambdaRad - omegaRad) * Math.cos(i);
  const zOrb = dist * Math.sin(lambdaRad - omegaRad) * Math.sin(i);
  const x = xOrb * Math.cos(omegaRad) - zOrb * Math.sin(omegaRad);
  const z = xOrb * Math.sin(omegaRad) + zOrb * Math.cos(omegaRad);
  const y = yOrb;
  return new THREE.Vector3(x, y, z);
}

function getMoonPhaseInfo(date: Date) {
  const jd = date.getTime() / 86400000.0 + 2440587.5;
  const n = jd - 2451545.0;
  const L = ((218.316 + 13.176396 * n) % 360 + 360) % 360;
  const M = ((134.963 + 13.064993 * n) % 360 + 360) % 360;
  const C = 6.289 * Math.sin(THREE.MathUtils.degToRad(M));
  const lambda = ((L + C) % 360 + 360) % 360;
  const sunLambda = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
  const phaseAngle = ((lambda - sunLambda) % 360 + 360) % 360;
  const age = (phaseAngle / 360) * 29.53;
  const illum = (1 - Math.cos(THREE.MathUtils.degToRad(phaseAngle))) / 2 * 100;
  const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  const phaseIndex = Math.floor((phaseAngle / 360) * 8) % 8;
  return { phase: phases[phaseIndex], age, illum };
}

/* ─── SHADERS ─── */
const earthVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const earthFragmentShader = `
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D cloudTexture;
uniform vec3 sunDirection;
uniform float atmosphereStrength;
uniform float cityLightsStrength;
uniform float time;
uniform float rotationOffset;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vec2 rotatedUv = vec2(fract(vUv.x + rotationOffset), vUv.y);
  vec3 normal = normalize(vNormal);
  float sunDot = dot(normal, sunDirection);
  float dayMix = smoothstep(-0.15, 0.15, sunDot);
  vec4 dayColor = texture2D(dayTexture, rotatedUv);
  vec4 nightColor = texture2D(nightTexture, rotatedUv);
  vec4 cloudColor = texture2D(cloudTexture, rotatedUv);
  float cloudAlpha = cloudColor.r * 0.65;
  dayColor = mix(dayColor, vec4(0.95, 0.97, 1.0, 1.0), cloudAlpha);
  vec4 color = mix(nightColor, dayColor, dayMix);
  float cityGlow = nightColor.r * (1.0 - dayMix) * cityLightsStrength;
  color += vec4(cityGlow * 2.0, cityGlow * 1.5, cityGlow * 0.5, 0.0);
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
  vec3 atmosDay = vec3(0.35, 0.65, 1.0);
  vec3 atmosSunset = vec3(1.0, 0.55, 0.25);
  vec3 atmosNight = vec3(0.15, 0.08, 0.35);
  float sunsetMix = smoothstep(-0.05, 0.15, sunDot) * (1.0 - smoothstep(0.1, 0.35, sunDot));
  vec3 atmosColor = mix(atmosNight, atmosDay, smoothstep(-0.15, 0.15, sunDot));
  atmosColor = mix(atmosColor, atmosSunset, sunsetMix);
  color += vec4(atmosColor * fresnel * atmosphereStrength, fresnel * atmosphereStrength);
  float specular = pow(max(dot(reflect(-sunDirection, normal), viewDir), 0.0), 32.0);
  color += vec4(specular * dayMix * 0.2);
  gl_FragColor = color;
}
`;

const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmosphereFragmentShader = `
uniform vec3 sunDirection;
uniform float strength;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.5);
  float sunDot = dot(normal, sunDirection);
  vec3 dayColor = vec3(0.4, 0.75, 1.0);
  vec3 sunsetColor = vec3(1.0, 0.65, 0.35);
  vec3 nightColor = vec3(0.25, 0.15, 0.5);
  float dayMix = smoothstep(-0.25, 0.15, sunDot);
  float sunsetMix = smoothstep(-0.1, 0.15, sunDot) * (1.0 - smoothstep(0.1, 0.4, sunDot));
  vec3 color = mix(nightColor, dayColor, dayMix);
  color = mix(color, sunsetColor, sunsetMix);
  float alpha = fresnel * strength * (0.4 + 0.6 * dayMix);
  gl_FragColor = vec4(color, alpha);
}
`;

/* ─── 3D COMPONENTS ─── */

function EarthMesh({
  textures,
  sunDirection,
  settings,
  rotationOffset,
}: {
  textures: { day?: THREE.Texture; night?: THREE.Texture; cloud?: THREE.Texture };
  sunDirection: THREE.Vector3;
  settings: Settings;
  rotationOffset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      dayTexture: { value: textures.day || new THREE.Texture() },
      nightTexture: { value: textures.night || new THREE.Texture() },
      cloudTexture: { value: textures.cloud || new THREE.Texture() },
      sunDirection: { value: sunDirection },
      atmosphereStrength: { value: settings.atmosphere ? 0.6 : 0.0 },
      cityLightsStrength: { value: settings.cityLights ? 1.0 : 0.0 },
      time: { value: 0 },
      rotationOffset: { value: rotationOffset },
    }),
    []
  );

  useEffect(() => {
    if (textures.day) uniforms.dayTexture.value = textures.day;
    if (textures.night) uniforms.nightTexture.value = textures.night;
    if (textures.cloud) uniforms.cloudTexture.value = textures.cloud;
  }, [textures]);

  useFrame((state) => {
    uniforms.sunDirection.value.copy(sunDirection);
    uniforms.atmosphereStrength.value = settings.atmosphere ? 0.6 : 0.0;
    uniforms.cityLightsStrength.value = settings.cityLights ? 1.0 : 0.0;
    uniforms.time.value = state.clock.elapsedTime;
    uniforms.rotationOffset.value = rotationOffset;
    if (meshRef.current) {
      meshRef.current.rotation.y = rotationOffset * Math.PI * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function AtmosphereMesh({ sunDirection, settings }: { sunDirection: THREE.Vector3; settings: Settings }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      sunDirection: { value: sunDirection },
      strength: { value: settings.atmosphere ? 1.2 : 0.0 },
    }),
    []
  );

  useFrame(() => {
    uniforms.sunDirection.value.copy(sunDirection);
    uniforms.strength.value = settings.atmosphere ? 1.2 : 0.0;
  });

  return (
    <mesh>
      <sphereGeometry args={[ATMOSPHERE_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function CloudMesh({ texture, settings }: { texture?: THREE.Texture; settings: Settings }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.002;
    }
  });

  if (!settings.clouds || !texture) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[CLOUD_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture} transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function MoonMesh({ position, texture }: { position: THREE.Vector3; texture?: THREE.Texture }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          color="#d4d4d8"
          emissive="#1a1a1a"
          emissiveIntensity={0.15}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[MOON_DISTANCE - 0.02, MOON_DISTANCE + 0.02, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function SunMesh({ direction }: { direction: THREE.Vector3 }) {
  const pos = direction.clone().multiplyScalar(SUN_DISTANCE);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[3.0, 32, 32]} />
        <meshBasicMaterial color="#fff5d1" />
      </mesh>
      <pointLight intensity={4} distance={120} color="#fff5d1" />
      <mesh>
        <sphereGeometry args={[5.0, 32, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StarBackground({ texture }: { texture?: THREE.Texture }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.0005;
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[80, 32, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

/* ─── ARCS — Our Journey curved paths ─── */
function ArcLine({ arc, settings }: { arc: ArcData; settings: Settings }) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const geometry = useMemo(() => {
    const start = latLonToVector3(arc.startLat, arc.startLon, EARTH_RADIUS + 0.05);
    const end = latLonToVector3(arc.endLat, arc.endLon, EARTH_RADIUS + 0.05);
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    const dist = start.distanceTo(end);
    mid.normalize().multiplyScalar(EARTH_RADIUS + 0.05 + dist * 0.4);
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    return new THREE.TubeGeometry(curve, 64, 0.008, 8, false);
  }, [arc]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  if (!settings.arcs) return null;

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        ref={materialRef}
        color={arc.color}
        transparent
        opacity={0.5}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─── RIPPLE RING ─── */
function RippleRing({ position, color, onDone }: { position: THREE.Vector3; color: string; onDone: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / 2.0;
    if (progress >= 1) {
      onDone();
      return;
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + progress * 4);
    }
    if (materialRef.current) {
      materialRef.current.opacity = (1 - progress) * 0.6;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.02, 0.04, 32]} />
      <meshBasicMaterial ref={materialRef} color={color} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ─── CITY MARKERS with smart occlusion ─── */
function CityMarkers({ cities, zoomLevel, settings }: { cities: CityData[]; zoomLevel: number; settings: Settings }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showCities) return null;

  return (
    <>
      {cities.map((city) => {
        const pos = latLonToVector3(city.lat, city.lon, EARTH_RADIUS + 0.03);
        return (
          <group key={city.name} position={pos}>
            <mesh>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#ffd700" />
            </mesh>
            {settings.labels && (
              <Html center distanceFactor={10} style={{ pointerEvents: "none", userSelect: "none" }}>
                <div
                  style={{
                    background: "rgba(8,8,22,0.8)",
                    backdropFilter: "blur(8px)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    fontSize: "0.68rem",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {city.flag} {city.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

/* ─── FAMILY MARKERS ─── */
function FamilyMarkers({ zoomLevel }: { zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showFamily) return null;

  return (
    <>
      {[
        { name: "Dal", lat: -1.286389, lon: 36.817223, emoji: "💕", label: "Dal 💕" },
        { name: "You", lat: -1.286389, lon: 36.817223, emoji: "💕", label: "You 💕" },
      ].map((member, i) => {
        const pos = latLonToVector3(member.lat, member.lon, EARTH_RADIUS + 0.05);
        const offset = new THREE.Vector3(0.06 * (i === 0 ? -1 : 1), 0.03, 0);
        pos.add(offset);
        return (
          <group key={member.name} position={pos}>
            <Html center distanceFactor={3} style={{ pointerEvents: "none" }}>
              <div style={{ fontSize: "1.6rem", filter: "drop-shadow(0 0 10px rgba(255,107,157,0.8))", animation: "pulseGlow 2s ease-in-out infinite" }}>
                {member.emoji}
              </div>
            </Html>
            <Html center distanceFactor={3} style={{ pointerEvents: "none", marginTop: "32px" }}>
              <div
                style={{
                  background: "rgba(255,107,157,0.15)",
                  backdropFilter: "blur(8px)",
                  padding: "3px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,107,157,0.25)",
                  color: "#ff6b9d",
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  boxShadow: "0 0 16px rgba(255,107,157,0.15)",
                }}
              >
                {member.label}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

/* ─── GRATICULE ─── */
function Graticule({ zoomLevel }: { zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showBoundaries) return null;

  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lon = -180; lon <= 180; lon += 3) {
        arr.push(latLonToVector3(lat, lon, EARTH_RADIUS + 0.005));
      }
    }
    for (let lon = -180; lon < 180; lon += 15) {
      for (let lat = -90; lat <= 90; lat += 3) {
        arr.push(latLonToVector3(lat, lon, EARTH_RADIUS + 0.005));
      }
    }
    return arr;
  }, []);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.06} />
    </lineSegments>
  );
}

/* ─── NAIROBI CITY SCENE ─── */
function NairobiScene({ zoomLevel }: { zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showNairobi) return null;

  const basePos = latLonToVector3(NAIROBI.lat, NAIROBI.lon, EARTH_RADIUS);
  const up = basePos.clone().normalize();
  const east = new THREE.Vector3(0, 1, 0).cross(up).normalize();
  const north = up.clone().cross(east).normalize();

  const roadPoints = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = -3; i <= 3; i++) {
      for (let j = -20; j <= 20; j++) {
        const p1 = basePos.clone().add(east.clone().multiplyScalar(i * 0.1)).add(north.clone().multiplyScalar(j * 0.02));
        const p2 = basePos.clone().add(east.clone().multiplyScalar(i * 0.1)).add(north.clone().multiplyScalar((j + 1) * 0.02));
        arr.push(p1, p2);
      }
      for (let j = -20; j <= 20; j++) {
        const p1 = basePos.clone().add(north.clone().multiplyScalar(i * 0.1)).add(east.clone().multiplyScalar(j * 0.02));
        const p2 = basePos.clone().add(north.clone().multiplyScalar(i * 0.1)).add(east.clone().multiplyScalar((j + 1) * 0.02));
        arr.push(p1, p2);
      }
    }
    return arr;
  }, [basePos, east, north]);

  const roadGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(roadPoints), [roadPoints]);

  const buildingCount = 120;
  const buildingGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const buildingMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const palette = [
      new THREE.Color("#d4c4a8"),
      new THREE.Color("#c0c0c0"),
      new THREE.Color("#f0f0f0"),
      new THREE.Color("#8b7355"),
      new THREE.Color("#a8c8ec"),
      new THREE.Color("#e8ddd0"),
    ];
    let idx = 0;
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        if (Math.abs(x) < 0.5 && Math.abs(z) < 0.5) continue;
        if (Math.random() > 0.7) continue;
        const bx = basePos.clone().add(east.clone().multiplyScalar(x * 0.1 + (Math.random() - 0.5) * 0.03));
        bx.add(north.clone().multiplyScalar(z * 0.1 + (Math.random() - 0.5) * 0.03));
        const height = 0.015 + Math.random() * 0.08;
        const width = 0.02 + Math.random() * 0.015;
        dummy.position.copy(bx);
        dummy.position.add(up.clone().multiplyScalar(height / 2));
        dummy.scale.set(width, height, width);
        dummy.lookAt(basePos);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);
        meshRef.current.setColorAt(idx, palette[Math.floor(Math.random() * palette.length)]);
        idx++;
        if (idx >= buildingCount) break;
      }
      if (idx >= buildingCount) break;
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [basePos, east, north, up]);

  const parkPositions = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const px = basePos.clone().add(east.clone().multiplyScalar((Math.random() - 0.5) * 0.5));
      px.add(north.clone().multiplyScalar((Math.random() - 0.5) * 0.5));
      arr.push(px);
    }
    return arr;
  }, [basePos, east, north]);

  return (
    <group>
      <lineSegments geometry={roadGeo}>
        <lineBasicMaterial color="#444444" transparent opacity={0.5} />
      </lineSegments>
      <instancedMesh ref={meshRef} args={[buildingGeo, buildingMat, buildingCount]} />
      {parkPositions.map((pos, i) => (
        <ParkCircle key={i} position={pos} target={basePos} />
      ))}
      <mesh position={basePos.clone().add(east.clone().multiplyScalar(0.2)).add(north.clone().multiplyScalar(0.15)).add(up.clone().multiplyScalar(0.05))}>
        <boxGeometry args={[0.025, 0.1, 0.025]} />
        <meshStandardMaterial color="#e8ddd0" />
      </mesh>
      <mesh position={basePos.clone().add(east.clone().multiplyScalar(-0.15)).add(north.clone().multiplyScalar(0.2)).add(up.clone().multiplyScalar(0.03))}>
        <boxGeometry args={[0.05, 0.06, 0.03]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
    </group>
  );
}

function ParkCircle({ position, target }: { position: THREE.Vector3; target: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (ref.current) ref.current.lookAt(target);
  }, [target]);
  return (
    <mesh ref={ref} position={position}>
      <circleGeometry args={[0.04, 16]} />
      <meshBasicMaterial color="#4a7c59" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── EMOJI PEOPLE — using THREE.Sprite (always faces camera) ─── */
function EmojiPeople({ zoomLevel }: { zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showNairobi) return null;

  const people = useMemo(() => [
    { emoji: "👦🎒", waypoints: [[-1.29, 36.81], [-1.28, 36.82], [-1.29, 36.81]], speed: 0.0008, offset: 0 },
    { emoji: "🧒⚽", waypoints: [[-1.285, 36.815], [-1.29, 36.82], [-1.295, 36.815], [-1.285, 36.815]], speed: 0.0012, offset: 1 },
    { emoji: "🚶‍♂️", waypoints: [[-1.28, 36.81], [-1.28, 36.825], [-1.28, 36.81]], speed: 0.0006, offset: 2 },
    { emoji: "👧📖", waypoints: [[-1.292, 36.818], [-1.282, 36.822], [-1.292, 36.818]], speed: 0.0007, offset: 3 },
    { emoji: "🧑‍🤝‍🧑", waypoints: [[-1.286, 36.817], [-1.286, 36.819], [-1.286, 36.817]], speed: 0.0005, offset: 4 },
    { emoji: "👶", waypoints: [[-1.288, 36.816], [-1.288, 36.818], [-1.288, 36.816]], speed: 0.0009, offset: 5 },
    { emoji: "🙏", waypoints: [[-1.287, 36.818]], speed: 0, offset: 0 },
    { emoji: "👩‍🏫", waypoints: [[-1.28, 36.82], [-1.285, 36.815], [-1.28, 36.82]], speed: 0.0007, offset: 6 },
    { emoji: "🐕", waypoints: [[-1.284, 36.814], [-1.29, 36.816], [-1.284, 36.814]], speed: 0.001, offset: 7 },
    { emoji: "👨‍👩‍👧", waypoints: [[-1.286, 36.817]], speed: 0, offset: 0 },
  ], []);

  const sprites = useMemo(() => {
    return people.map((person) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.font = "48px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(person.emoji, 32, 32);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    });
  }, [people]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const sprite = child as THREE.Sprite;
      const p = people[i];
      if (!p || p.waypoints.length === 0) return;
      const cycle = (t * p.speed + p.offset) % 1;
      const segment = cycle * (p.waypoints.length - 1);
      const idx = Math.floor(segment);
      const frac = segment - idx;
      const w1 = p.waypoints[idx] || p.waypoints[0];
      const w2 = p.waypoints[Math.min(idx + 1, p.waypoints.length - 1)] || w1;
      const lat = w1[0] + (w2[0] - w1[0]) * frac;
      const lon = w1[1] + (w2[1] - w1[1]) * frac;
      const pos = latLonToVector3(lat, lon, EARTH_RADIUS + 0.05);
      pos.add(new THREE.Vector3(0, 0.025 + Math.sin(t * 3 + p.offset) * 0.01, 0));
      sprite.position.copy(pos);
      sprite.scale.setScalar(0.08);
    });
  });

  return (
    <group ref={groupRef}>
      {sprites.map((mat, i) => (
        <sprite key={i} material={mat} />
      ))}
    </group>
  );
}

/* ─── SHOOTING STARS with trails ─── */
function ShootingStars({ birthdayMode }: { birthdayMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<{ mesh: THREE.Mesh; velocity: THREE.Vector3; life: number; maxLife: number }[]>([]);

  const spawnStar = useCallback(() => {
    if (!groupRef.current) return;
    const geo = new THREE.CylinderGeometry(0.004, 0.001, 0.5, 4);
    geo.rotateZ(Math.PI / 2);
    const color = birthdayMode ? (Math.random() > 0.5 ? "#ffd700" : "#ff6b9d") : "#ffffff";
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.4 + 0.1;
    const r = 15 + Math.random() * 10;
    mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    const target = new THREE.Vector3((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 25);
    const velocity = target.sub(mesh.position).normalize().multiplyScalar(4 + Math.random() * 5);
    mesh.lookAt(mesh.position.clone().add(velocity));
    groupRef.current.add(mesh);
    const maxLife = 1.0 + Math.random() * 1.5;
    starsRef.current.push({ mesh, velocity, life: maxLife, maxLife });
  }, [birthdayMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > (birthdayMode ? 0.3 : 0.75)) spawnStar();
    }, birthdayMode ? 3000 : 8000);
    return () => clearInterval(interval);
  }, [birthdayMode, spawnStar]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const toRemove: number[] = [];
    starsRef.current.forEach((star, i) => {
      star.life -= delta;
      star.mesh.position.add(star.velocity.clone().multiplyScalar(delta));
      const mat = star.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, star.life / 0.3) * Math.min(1, (star.maxLife - star.life) / 0.2);
      if (star.life <= 0) {
        groupRef.current?.remove(star.mesh);
        star.mesh.geometry.dispose();
        mat.dispose();
        toRemove.push(i);
      }
    });
    starsRef.current = starsRef.current.filter((_, i) => !toRemove.includes(i));
  });

  return <group ref={groupRef} />;
}

/* ─── LOADING FALLBACK ─── */
function LoadingFallback() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 20, color: "var(--lunar)" }}>
      <div className="loading-spinner" />
      <p>Loading Universe for Dal...</p>
    </div>
  );
}

/* ─── MAIN EXPORT ─── */
export default function Universe3D() {
  const [kenyaTime, setKenyaTime] = useState<Date>(getKenyaTime());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [settings, setSettings] = useState<Settings>({
    dayNightShader: true,
    cityLights: true,
    clouds: true,
    atmosphere: true,
    autoReturn: true,
    labels: true,
    timeInfo: false,
    sunMoonInfo: false,
    arcs: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; position: THREE.Vector3; color: string }[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);
  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Kenya time
  useEffect(() => {
    const interval = setInterval(() => setKenyaTime(getKenyaTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Birthday mode
  const birthdayMode = useMemo(() => {
    const k = kenyaTime;
    return k.getMonth() === 5 && k.getDate() === 1;
  }, [kenyaTime]);

  // Sun/moon info
  const sunInfo = useMemo(() => {
    const { altitude, azimuth } = getSunAltitudeAzimuth(kenyaTime, NAIROBI.lat, NAIROBI.lon);
    let status = "Night";
    if (altitude > 5) status = "Day";
    else if (altitude > -5) status = altitude > 0 ? "Sunset" : "Twilight";
    else if (altitude > -12) status = "Nautical Twilight";
    return { altitude, azimuth, status };
  }, [kenyaTime]);

  const moonInfo = useMemo(() => getMoonPhaseInfo(kenyaTime), [kenyaTime]);

  // Textures
  const dayTex = useTexture(TEX.day);
  const nightTex = useTexture(TEX.night);
  const cloudTex = useTexture(TEX.cloud);
  const moonTex = useTexture(TEX.moon);
  const starsTex = useTexture(TEX.stars);

  const textures = useMemo(() => ({
    day: dayTex,
    night: nightTex,
    cloud: cloudTex,
  }), [dayTex, nightTex, cloudTex]);

  // Sun direction
  const sunDir = useMemo(() => getSunDirection(kenyaTime), [kenyaTime]);
  const moonPos = useMemo(() => getMoonPosition(kenyaTime), [kenyaTime]);

  // Earth rotation
  const rotationOffset = useMemo(() => {
    const jd = kenyaTime.getTime() / 86400000.0 + 2440587.5;
    const n = jd - 2451545.0;
    const earthRotation = (n * 360.9856) % 360;
    return ((earthRotation - 37) % 360) / 360;
  }, [kenyaTime]);

  // Zoom
  const handleZoom = useCallback((delta: number) => {
    setZoomLevel((prev) => Math.max(0, Math.min(3, prev + delta)));
  }, []);

  // Ripple on click
  const handleEarthClick = useCallback((e: any) => {
    if (!e.point) return;
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, position: e.point.clone(), color: "#c084fc" }]);
  }, []);

  // Auto-return
  useEffect(() => {
    if (!settings.autoReturn) return;
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => {
      setIsInteracting(true);
      if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    };
    const onEnd = () => {
      setIsInteracting(false);
      returnTimerRef.current = setTimeout(() => {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }, 3000);
    };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);
    return () => {
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
    };
  }, [settings.autoReturn]);

  useEffect(() => {
    if (isInteracting && controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  }, [isInteracting]);

  const formatKenyaTime = (d: Date) => {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const s = d.getSeconds().toString().padStart(2, "0");
    return `${h}:${m}:${s} EAT`;
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "Africa/Nairobi",
    });
  };

  const config = ZOOM_LEVELS[zoomLevel];

  return (
    <div className="universe-view">
      {/* 3D Canvas */}
      <div className="universe-canvas-container">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            camera={{
              position: config.cameraPos,
              fov: config.fov,
              near: 0.1,
              far: 1000,
            }}
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]}
          >
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={config.minD}
              maxDistance={config.maxD}
              autoRotate={false}
              autoRotateSpeed={0.5}
              dampingFactor={0.08}
              enableDamping
              rotateSpeed={0.6}
              zoomSpeed={0.8}
            />
            <ambientLight intensity={0.15} />
            <directionalLight position={sunDir.clone().multiplyScalar(20).toArray()} intensity={1.8} color="#fff8e7" />
            <pointLight position={[-10, -5, -10]} intensity={0.4} color="#8b5cf6" distance={50} />
            <pointLight position={[0, -10, 5]} intensity={0.3} color="#00d4ff" distance={30} />

            <StarBackground texture={starsTex} />
            <EarthMesh textures={textures} sunDirection={sunDir} settings={settings} rotationOffset={rotationOffset} />
            <AtmosphereMesh sunDirection={sunDir} settings={settings} />
            <CloudMesh texture={cloudTex} settings={settings} />
            <MoonMesh position={moonPos} texture={moonTex} />
            <SunMesh direction={sunDir} />

            {/* Arcs */}
            {config.showArcs && ARCS.map((arc, i) => (
              <ArcLine key={i} arc={arc} settings={settings} />
            ))}

            {/* Ripples */}
            {ripples.map((ripple) => (
              <RippleRing
                key={ripple.id}
                position={ripple.position}
                color={ripple.color}
                onDone={() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id))}
              />
            ))}

            <CityMarkers cities={CITIES} zoomLevel={zoomLevel} settings={settings} />
            <FamilyMarkers zoomLevel={zoomLevel} />
            <Graticule zoomLevel={zoomLevel} />
            <NairobiScene zoomLevel={zoomLevel} />
            <EmojiPeople zoomLevel={zoomLevel} />
            <ShootingStars birthdayMode={birthdayMode} />
          </Canvas>
        </Suspense>
      </div>

      {/* ─── CLEAN HEADER ─── */}
      <div className="universe-header" style={{ minWidth: "auto", padding: "12px 18px" }}>
        <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "white", letterSpacing: "-0.02em" }}>
          {formatKenyaTime(kenyaTime)}
        </div>
        {settings.timeInfo && (
          <div style={{ fontSize: "0.72rem", color: "var(--lunar)", marginTop: 4 }}>
            {formatDate(kenyaTime)} · Nairobi, Kenya · UTC+3
          </div>
        )}
        {settings.sunMoonInfo && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: "0.9rem" }}>☀️</span>
              <span style={{ fontSize: "0.72rem", color: "var(--lunar)" }}>
                {sunInfo.status} · {sunInfo.altitude.toFixed(0)}°
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: "0.9rem" }}>🌙</span>
              <span style={{ fontSize: "0.72rem", color: "var(--lunar)" }}>
                {moonInfo.phase} · {moonInfo.illum.toFixed(0)}%
              </span>
            </div>
          </>
        )}
        {birthdayMode && (
          <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(255,107,157,0.12)", borderRadius: 8, border: "1px solid rgba(255,107,157,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: "0.78rem", color: "#ff6b9d", fontWeight: 600 }}>🎉 Happy Birthday Dal! 🎂</div>
          </div>
        )}
      </div>

      {/* ─── SETTINGS DROPDOWN ─── */}
      <div className="universe-controls">
        <div style={{ position: "relative" }}>
          <button
            className="action-btn"
            onClick={() => setSettingsOpen(!settingsOpen)}
            style={{ width: 38, height: 38, borderRadius: "50%", padding: 0, justifyContent: "center", fontSize: "1.1rem" }}
          >
            ⚙️
          </button>
          {settingsOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: 240,
                background: "rgba(8, 8, 22, 0.92)",
                backdropFilter: "blur(24px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                zIndex: 200,
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--lunar)" }}>
                Settings
              </div>
              {[
                { key: "dayNightShader" as keyof Settings, icon: "🌗", label: "Day/Night Shader" },
                { key: "cityLights" as keyof Settings, icon: "🏙️", label: "City Lights" },
                { key: "clouds" as keyof Settings, icon: "☁️", label: "Clouds" },
                { key: "atmosphere" as keyof Settings, icon: "🌈", label: "Atmosphere" },
                { key: "autoReturn" as keyof Settings, icon: "🔄", label: "Auto-Return" },
                { key: "labels" as keyof Settings, icon: "🏷️", label: "Labels" },
                { key: "arcs" as keyof Settings, icon: "✈️", label: "Journey Arcs" },
                { key: "timeInfo" as keyof Settings, icon: "📅", label: "Show Date" },
                { key: "sunMoonInfo" as keyof Settings, icon: "🌓", label: "Sun & Moon Info" },
              ].map((item) => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", color: "var(--stardust)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                  <div
                    onClick={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key] }))}
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 10,
                      background: settings[item.key] ? "linear-gradient(135deg, #c084fc, #00d4ff)" : "rgba(255,255,255,0.1)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        left: settings[item.key] ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.3s cubic-bezier(0.16,1,0.3,1)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM ZOOM CONTROLS ─── */}
      <div className="universe-actions">
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "6px 14px" }}>
          <button
            className="action-btn"
            onClick={() => handleZoom(-1)}
            style={{ width: 32, height: 32, borderRadius: "50%", padding: 0, justifyContent: "center", fontSize: "1.1rem", fontWeight: 700 }}
          >
            −
          </button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90 }}>
            <span style={{ fontSize: "0.68rem", color: "var(--lunar)" }}>Zoom</span>
            <span style={{ fontSize: "0.8rem", color: "white", fontWeight: 600 }}>{config.name}</span>
          </div>
          <button
            className="action-btn"
            onClick={() => handleZoom(1)}
            style={{ width: 32, height: 32, borderRadius: "50%", padding: 0, justifyContent: "center", fontSize: "1.1rem", fontWeight: 700 }}
          >
            +
          </button>
        </div>

        <button className="action-btn" onClick={() => setZoomLevel(3)}>
          <span>💕</span>
          <span>Family</span>
        </button>

        <button className="action-btn" onClick={() => setZoomLevel(0)}>
          <span>🌌</span>
          <span>Space</span>
        </button>
      </div>
    </div>
  );
}
