"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   BYEOL UNIVERSE 3D v4.0 — For Dal
   Birthday gift. Kenya time. Real sun & moon. Living world.
   ═══════════════════════════════════════════════════════════════ */

/* ─── TYPES ─── */
interface CityData {
  name: string;
  lat: number;
  lon: number;
  country: string;
  flag: string;
}

interface FamilyMarker {
  name: string;
  lat: number;
  lon: number;
  emoji: string;
  label: string;
}

interface PersonData {
  emoji: string;
  waypoints: [number, number][]; // lat, lon
  speed: number;
  offset: number;
  type: "school" | "play" | "church" | "walk" | "family";
}

interface ZoomConfig {
  name: string;
  cameraPos: [number, number, number];
  minD: number;
  maxD: number;
  showCities: boolean;
  showClouds: boolean;
  showBoundaries: boolean;
  showNairobi: boolean;
  showFamily: boolean;
}

interface Settings {
  dayNightShader: boolean;
  cityLights: boolean;
  clouds: boolean;
  atmosphere: boolean;
  autoReturn: boolean;
  labels: boolean;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  country: string;
  flag: string;
  lat: number;
  lon: number;
}

/* ─── CONSTANTS ─── */
const NAIROBI = { lat: -1.286389, lon: 36.817223, name: "Nairobi" };
const EARTH_RADIUS = 1.6;
const ATMOSPHERE_RADIUS = 1.68;
const CLOUD_RADIUS = 1.65;
const MOON_DISTANCE = 5.0;
const SUN_DISTANCE = 40.0;

const ZOOM_LEVELS: ZoomConfig[] = [
  {
    name: "Solar System",
    cameraPos: [0, 4, 14],
    minD: 6,
    maxD: 30,
    showCities: false,
    showClouds: false,
    showBoundaries: false,
    showNairobi: false,
    showFamily: false,
  },
  {
    name: "Earth & Moon",
    cameraPos: [0, 2, 8],
    minD: 4,
    maxD: 12,
    showCities: false,
    showClouds: true,
    showBoundaries: false,
    showNairobi: false,
    showFamily: false,
  },
  {
    name: "Cities",
    cameraPos: [0, 1, 4.5],
    minD: 2.5,
    maxD: 7,
    showCities: true,
    showClouds: true,
    showBoundaries: true,
    showNairobi: false,
    showFamily: false,
  },
  {
    name: "Family",
    cameraPos: [0.15, 0.25, 2.8],
    minD: 1.8,
    maxD: 4,
    showCities: true,
    showClouds: false,
    showBoundaries: false,
    showNairobi: true,
    showFamily: true,
  },
];

const CITIES: CityData[] = [
  { name: "Nairobi", lat: -1.286389, lon: 36.817223, country: "Kenya", flag: "🇰🇪" },
  { name: "Mombasa", lat: -4.043477, lon: 39.668202, country: "Kenya", flag: "🇰🇪" },
  { name: "Kisumu", lat: -0.102222, lon: 34.761667, country: "Kenya", flag: "🇰🇪" },
  { name: "Nakuru", lat: -0.303099, lon: 36.066284, country: "Kenya", flag: "🇰🇪" },
  { name: "London", lat: 51.507351, lon: -0.127758, country: "United Kingdom", flag: "🇬🇧" },
  { name: "New York", lat: 40.712776, lon: -74.005974, country: "USA", flag: "🇺🇸" },
  { name: "Tokyo", lat: 35.676192, lon: 139.650311, country: "Japan", flag: "🇯🇵" },
  { name: "Paris", lat: 48.856613, lon: 2.352222, country: "France", flag: "🇫🇷" },
  { name: "Dubai", lat: 25.276987, lon: 55.296249, country: "UAE", flag: "🇦🇪" },
  { name: "Sydney", lat: -33.86882, lon: 151.209296, country: "Australia", flag: "🇦🇺" },
  { name: "Rio de Janeiro", lat: -22.906847, lon: -43.172897, country: "Brazil", flag: "🇧🇷" },
  { name: "Cairo", lat: 30.04442, lon: 31.235712, country: "Egypt", flag: "🇪🇬" },
  { name: "Lagos", lat: 6.524379, lon: 3.379206, country: "Nigeria", flag: "🇳🇬" },
  { name: "Mumbai", lat: 19.075984, lon: 72.877656, country: "India", flag: "🇮🇳" },
  { name: "Singapore", lat: 1.352083, lon: 103.819836, country: "Singapore", flag: "🇸🇬" },
  { name: "Cape Town", lat: -33.924869, lon: 18.424055, country: "South Africa", flag: "🇿🇦" },
  { name: "Moscow", lat: 55.755826, lon: 37.6173, country: "Russia", flag: "🇷🇺" },
  { name: "Beijing", lat: 39.904202, lon: 116.407394, country: "China", flag: "🇨🇳" },
  { name: "Los Angeles", lat: 34.052234, lon: -118.243685, country: "USA", flag: "🇺🇸" },
  { name: "Mexico City", lat: 19.432608, lon: -99.133209, country: "Mexico", flag: "🇲🇽" },
];

const FAMILY: FamilyMarker[] = [
  { name: "Dal", lat: -1.286389, lon: 36.817223, emoji: "💕", label: "Dal 💕 — Here" },
  { name: "You", lat: -1.286389, lon: 36.817223, emoji: "💕", label: "You 💕 — Together" },
];

const PEOPLE: PersonData[] = [
  { emoji: "👦🎒", waypoints: [[-1.29, 36.81], [-1.28, 36.82], [-1.29, 36.81]], speed: 0.0008, offset: 0, type: "school" },
  { emoji: "🧒⚽", waypoints: [[-1.285, 36.815], [-1.29, 36.82], [-1.295, 36.815], [-1.285, 36.815]], speed: 0.0012, offset: 1, type: "play" },
  { emoji: "🚶‍♂️", waypoints: [[-1.28, 36.81], [-1.28, 36.825], [-1.28, 36.81]], speed: 0.0006, offset: 2, type: "walk" },
  { emoji: "👧📖", waypoints: [[-1.292, 36.818], [-1.282, 36.822], [-1.292, 36.818]], speed: 0.0007, offset: 3, type: "school" },
  { emoji: "🧑‍🤝‍🧑", waypoints: [[-1.286, 36.817], [-1.286, 36.819], [-1.286, 36.817]], speed: 0.0005, offset: 4, type: "walk" },
  { emoji: "👶", waypoints: [[-1.288, 36.816], [-1.288, 36.818], [-1.288, 36.816]], speed: 0.0009, offset: 5, type: "play" },
  { emoji: "🙏", waypoints: [[-1.287, 36.818]], speed: 0, offset: 0, type: "church" },
  { emoji: "👩‍🏫", waypoints: [[-1.28, 36.82], [-1.285, 36.815], [-1.28, 36.82]], speed: 0.0007, offset: 6, type: "walk" },
  { emoji: "🐕", waypoints: [[-1.284, 36.814], [-1.29, 36.816], [-1.284, 36.814]], speed: 0.001, offset: 7, type: "walk" },
  { emoji: "👨‍👩‍👧", waypoints: [[-1.286, 36.817]], speed: 0, offset: 0, type: "family" },
];

const COUNTRIES = [
  { name: "Kenya", flag: "🇰🇪", bounds: { minLat: -5, maxLat: 5.5, minLon: 34, maxLon: 42.5 } },
  { name: "Tanzania", flag: "🇹🇿", bounds: { minLat: -12, maxLat: -1, minLon: 29.5, maxLon: 40.5 } },
  { name: "Uganda", flag: "🇺🇬", bounds: { minLat: -1.5, maxLat: 4.5, minLon: 29.5, maxLon: 35 } },
  { name: "Ethiopia", flag: "🇪🇹", bounds: { minLat: 3.5, maxLat: 18, minLon: 33, maxLon: 48 } },
  { name: "Somalia", flag: "🇸🇴", bounds: { minLat: -2, maxLat: 12, minLon: 41, maxLon: 51 } },
  { name: "South Sudan", flag: "🇸🇸", bounds: { minLat: 3.5, maxLat: 12.5, minLon: 24, maxLon: 36 } },
  { name: "Rwanda", flag: "🇷🇼", bounds: { minLat: -3, maxLat: -1, minLon: 28.5, maxLon: 31 } },
  { name: "Burundi", flag: "🇧🇮", bounds: { minLat: -4.5, maxLat: -2.3, minLon: 29, maxLon: 30.5 } },
  { name: "Democratic Republic of the Congo", flag: "🇨🇩", bounds: { minLat: -14, maxLat: 5.5, minLon: 12, maxLon: 31.5 } },
  { name: "United Kingdom", flag: "🇬🇧", bounds: { minLat: 50, maxLat: 59, minLon: -8, maxLon: 2 } },
  { name: "USA", flag: "🇺🇸", bounds: { minLat: 24, maxLat: 49, minLon: -125, maxLon: -66 } },
  { name: "Japan", flag: "🇯🇵", bounds: { minLat: 24, maxLat: 46, minLon: 122, maxLon: 146 } },
  { name: "France", flag: "🇫🇷", bounds: { minLat: 41, maxLat: 51, minLon: -5, maxLon: 8 } },
  { name: "UAE", flag: "🇦🇪", bounds: { minLat: 22.5, maxLat: 26.5, minLon: 51, maxLon: 56.5 } },
  { name: "Australia", flag: "🇦🇺", bounds: { minLat: -44, maxLat: -10, minLon: 113, maxLon: 154 } },
  { name: "Brazil", flag: "🇧🇷", bounds: { minLat: -34, maxLat: 5, minLon: -74, maxLon: -34 } },
  { name: "Egypt", flag: "🇪🇬", bounds: { minLat: 22, maxLat: 32, minLon: 25, maxLon: 35 } },
  { name: "Nigeria", flag: "🇳🇬", bounds: { minLat: 4, maxLat: 14, minLon: 3, maxLon: 14 } },
  { name: "India", flag: "🇮🇳", bounds: { minLat: 6, maxLat: 37, minLon: 68, maxLon: 97 } },
  { name: "Singapore", flag: "🇸🇬", bounds: { minLat: 1.2, maxLat: 1.5, minLon: 103.6, maxLon: 104.1 } },
  { name: "South Africa", flag: "🇿🇦", bounds: { minLat: -35, maxLat: -22, minLon: 16, maxLon: 33 } },
  { name: "Russia", flag: "🇷🇺", bounds: { minLat: 50, maxLat: 70, minLon: 30, maxLon: 60 } },
  { name: "China", flag: "🇨🇳", bounds: { minLat: 18, maxLat: 54, minLon: 73, maxLon: 135 } },
  { name: "Mexico", flag: "🇲🇽", bounds: { minLat: 14, maxLat: 33, minLon: -118, maxLon: -86 } },
];

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
  const kenyaStr = now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" });
  return new Date(kenyaStr);
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
  // Convert sun direction to local altitude/azimuth for the given lat/lon
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  // Local coordinate system at lat/lon
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
  return { phase: phases[phaseIndex], age, illum, phaseAngle };
}

function findCountry(lat: number, lon: number): { name: string; flag: string } | null {
  let best = null;
  let bestDist = Infinity;
  for (const c of COUNTRIES) {
    const b = c.bounds;
    if (lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon) {
      const cx = (b.minLon + b.maxLon) / 2;
      const cy = (b.minLat + b.maxLat) / 2;
      const dist = Math.sqrt(Math.pow(lon - cx, 2) + Math.pow(lat - cy, 2));
      if (dist < bestDist) {
        bestDist = dist;
        best = { name: c.name, flag: c.flag };
      }
    }
  }
  return best;
}

function pseudoNoise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = pseudoNoise(ix, iy);
  const b = pseudoNoise(ix + 1, iy);
  const c = pseudoNoise(ix, iy + 1);
  const d = pseudoNoise(ix + 1, iy + 1);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * smoothNoise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return val;
}

function continentField(lat: number, lon: number): number {
  // Simplified distance fields to continent centers
  const africa = Math.sqrt(Math.pow((lat - 5) / 22, 2) + Math.pow((lon - 20) / 22, 2));
  const europe = Math.sqrt(Math.pow((lat - 55) / 12, 2) + Math.pow((lon - 15) / 22, 2));
  const asia = Math.sqrt(Math.pow((lat - 40) / 32, 2) + Math.pow((lon - 90) / 50, 2));
  const americas = Math.sqrt(Math.pow((lat - 10) / 40, 2) + Math.pow((lon + 80) / 35, 2));
  const australia = Math.sqrt(Math.pow((lat + 25) / 15, 2) + Math.pow((lon - 135) / 22, 2));
  const antarctica = lat < -65 ? 0 : 2;
  const minDist = Math.min(africa, europe, asia, americas, australia, antarctica);
  const noise = fbm(lon * 0.08, lat * 0.08, 5);
  return minDist - noise * 0.35;
}

/* ─── PROCEDURAL TEXTURES ─── */
function generateDayTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const lat = (1 - y / H) * 180 - 90;
      const lon = (x / W) * 360 - 180;
      const field = continentField(lat, lon);
      const n = fbm(x / 200, y / 200, 4);
      const idx = (y * W + x) * 4;
      if (field < 0.52) {
        // Ocean
        const depth = 0.08 + n * 0.06;
        img.data[idx] = Math.floor(20 + depth * 80);
        img.data[idx + 1] = Math.floor(40 + depth * 100);
        img.data[idx + 2] = Math.floor(80 + depth * 120);
        img.data[idx + 3] = 255;
      } else {
        // Land
        const absLat = Math.abs(lat);
        let r: number, g: number, b: number;
        if (absLat > 65) {
          // Ice
          r = 240; g = 245; b = 250;
        } else if (absLat > 35 && n > 0.55) {
          // Desert / dry
          r = 190; g = 170; b = 130;
        } else if (absLat > 50) {
          // Boreal
          r = 80; g = 100; b = 60;
        } else if (lat > 0 && lon > 60 && lon < 140 && lat > 10 && lat < 45) {
          // Asia monsoon greens
          r = 60; g = 120; b = 50;
        } else {
          // General green
          const greenness = 0.4 + n * 0.3;
          r = Math.floor(80 + (1 - greenness) * 60);
          g = Math.floor(100 + greenness * 80);
          b = Math.floor(50 + n * 30);
        }
        // Mountains
        if (n > 0.7) {
          r += 30; g += 30; b += 30;
        }
        img.data[idx] = Math.min(255, r);
        img.data[idx + 1] = Math.min(255, g);
        img.data[idx + 2] = Math.min(255, b);
        img.data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateNightTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const cityLights: [number, number][] = [
    [36.8, -1.3], [39.7, -4.0], [37.6, 55.8], [-0.1, 51.5], [-74, 40.7],
    [139.7, 35.7], [2.3, 48.9], [55.3, 25.3], [151.2, -33.9], [-43.2, -22.9],
    [31.2, 30.0], [3.4, 6.5], [72.9, 19.1], [103.8, 1.4], [18.4, -33.9],
    [77.2, 28.6], [-99.1, 19.4], [116.4, 39.9], [-118.2, 34.1], [28.0, -26.2],
    [-46.6, -23.5], [151.0, -33.8], [2.1, 41.4], [12.5, 41.9], [-3.7, 40.4],
    [18.4, -33.9], [32.6, -25.7], [96.1, 16.8], [106.8, -6.2], [100.5, 13.7],
    [126.9, 37.6], [139.7, 35.7], [4.9, 52.4], [-0.1, 51.5], [13.4, 52.5],
    [30.3, 59.9], [37.6, 55.8], [-46.6, -23.5], [-58.4, -34.6], [-70.7, -33.5],
    [-99.1, 19.4], [-87.6, 41.9], [-97.3, 32.8], [-122.4, 37.8], [-84.4, 33.7],
    [-81.2, 28.5], [-80.2, 25.8], [-112.0, 33.5], [-117.2, 32.7], [-121.5, 38.6],
    [-122.7, 45.5], [-123.1, 49.3], [-79.4, 43.7], [-75.7, 45.4], [-73.6, 45.5],
    [121.5, 31.2], [114.1, 22.5], [113.3, 23.1], [120.6, 31.3], [106.7, 10.8],
    [77.2, 28.6], [88.4, 22.6], [80.3, 13.1], [72.9, 19.1], [67.0, 24.9],
    [77.5, 12.9], [78.5, 17.4], [73.9, 18.5], [85.8, 20.3], [91.8, 22.3],
    [90.4, 23.8], [51.4, 25.3], [55.3, 25.3], [46.7, 24.7], [39.2, 21.5],
    [47.5, 29.3], [58.4, 23.6], [31.2, 30.1], [29.9, 31.2], [18.4, -33.9],
    [28.0, -26.2], [31.0, -29.9], [25.6, -33.9], [18.5, -34.0], [147.3, -42.9],
    [153.0, -27.5], [115.9, -31.9], [149.1, -35.3], [138.6, -34.9], [174.8, -36.9],
    [151.2, -33.9], [144.9, -37.8], [145.0, -37.7], [153.4, -28.0], [150.7, -33.8],
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const lat = (1 - y / H) * 180 - 90;
      const lon = (x / W) * 360 - 180;
      const field = continentField(lat, lon);
      const idx = (y * W + x) * 4;
      if (field < 0.52) {
        img.data[idx] = 5; img.data[idx + 1] = 10; img.data[idx + 2] = 20; img.data[idx + 3] = 255;
      } else {
        let brightness = 8 + fbm(x / 150, y / 150, 3) * 12;
        // City light clusters
        for (const [clon, clat] of cityLights) {
          const d = Math.sqrt(Math.pow(lon - clon, 2) + Math.pow(lat - clat, 2));
          if (d < 3) brightness += (3 - d) * 15;
          if (d < 1) brightness += (1 - d) * 40;
        }
        brightness = Math.min(255, brightness);
        img.data[idx] = Math.floor(brightness * 1.2);
        img.data[idx + 1] = Math.floor(brightness * 0.9);
        img.data[idx + 2] = Math.floor(brightness * 0.5);
        img.data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateCloudTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) {
    const cx = Math.random() * W;
    const cy = Math.random() * H;
    const r = 80 + Math.random() * 200;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, "rgba(255,255,255,0.85)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.4)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateBumpTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const lat = (1 - y / H) * 180 - 90;
      const lon = (x / W) * 360 - 180;
      const field = continentField(lat, lon);
      const n = fbm(x / 100, y / 100, 5);
      const idx = (y * W + x) * 4;
      let h = 50;
      if (field > 0.52) {
        h = 100 + n * 100;
        if (n > 0.75) h += 50; // Mountains
      }
      img.data[idx] = h;
      img.data[idx + 1] = h;
      img.data[idx + 2] = h;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
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
uniform sampler2D bumpTexture;
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
  float dayMix = smoothstep(-0.12, 0.12, sunDot);

  vec4 dayColor = texture2D(dayTexture, rotatedUv);
  vec4 nightColor = texture2D(nightTexture, rotatedUv);
  vec4 cloudColor = texture2D(cloudTexture, rotatedUv);

  // Clouds on day side
  float cloudAlpha = cloudColor.r * 0.7;
  dayColor = mix(dayColor, vec4(0.95, 0.97, 1.0, 1.0), cloudAlpha);

  // Mix day/night
  vec4 color = mix(nightColor, dayColor, dayMix);

  // City lights bloom
  float cityGlow = nightColor.r * (1.0 - dayMix) * cityLightsStrength;
  color += vec4(cityGlow * 2.5, cityGlow * 1.8, cityGlow * 0.6, 0.0);

  // Atmosphere Fresnel
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

  vec3 atmosDay = vec3(0.35, 0.65, 1.0);
  vec3 atmosSunset = vec3(1.0, 0.55, 0.25);
  vec3 atmosNight = vec3(0.15, 0.08, 0.35);

  float sunsetMix = smoothstep(-0.05, 0.15, sunDot) * (1.0 - smoothstep(0.1, 0.35, sunDot));
  vec3 atmosColor = mix(atmosNight, atmosDay, smoothstep(-0.15, 0.15, sunDot));
  atmosColor = mix(atmosColor, atmosSunset, sunsetMix);

  color += vec4(atmosColor * fresnel * atmosphereStrength, fresnel * atmosphereStrength);

  // Ocean specular
  float specular = pow(max(dot(reflect(-sunDirection, normal), viewDir), 0.0), 32.0);
  color += vec4(specular * dayMix * 0.25);

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
  onClick,
}: {
  textures: { day?: THREE.Texture; night?: THREE.Texture; cloud?: THREE.Texture; bump?: THREE.Texture };
  sunDirection: THREE.Vector3;
  settings: Settings;
  rotationOffset: number;
  onClick: (lat: number, lon: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera, raycaster, pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      dayTexture: { value: textures.day || new THREE.Texture() },
      nightTexture: { value: textures.night || new THREE.Texture() },
      cloudTexture: { value: textures.cloud || new THREE.Texture() },
      bumpTexture: { value: textures.bump || new THREE.Texture() },
      sunDirection: { value: sunDirection },
      atmosphereStrength: { value: settings.atmosphere ? 0.6 : 0.0 },
      cityLightsStrength: { value: settings.cityLights ? 1.0 : 0.0 },
      time: { value: 0 },
      rotationOffset: { value: rotationOffset },
    }),
    []
  );

  useEffect(() => {
    uniforms.dayTexture.value = textures.day || uniforms.dayTexture.value;
    uniforms.nightTexture.value = textures.night || uniforms.nightTexture.value;
    uniforms.cloudTexture.value = textures.cloud || uniforms.cloudTexture.value;
    uniforms.bumpTexture.value = textures.bump || uniforms.bumpTexture.value;
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

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (!meshRef.current) return;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(meshRef.current);
      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv;
        const lon = uv.x * 360 - 180;
        const lat = (1 - uv.y) * 180 - 90;
        onClick(lat, lon);
      }
    },
    [camera, raycaster, pointer, onClick]
  );

  return (
    <mesh ref={meshRef} onClick={handleClick}>
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
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.002;
    }
  });

  if (!settings.clouds || !texture) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[CLOUD_RADIUS, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0.55}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function MoonMesh({ position }: { position: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.44, 32, 32]} />
        <meshStandardMaterial
          color="#d4d4d8"
          emissive="#1a1a1a"
          emissiveIntensity={0.15}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      {/* Orbit ring */}
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
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#fff5d1" />
      </mesh>
      <pointLight intensity={3} distance={100} color="#fff5d1" />
      {/* Glow sprite */}
      <Billboard>
        <mesh>
          <planeGeometry args={[12, 12]} />
          <meshBasicMaterial
            color="#ffd700"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

// Simple billboard component
function Billboard({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useFrame(() => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
  });
  return <group ref={ref}>{children}</group>;
}

function CityMarkers({ cities, zoomLevel }: { cities: CityData[]; zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showCities) return null;

  return (
    <>
      {cities.map((city) => {
        const pos = latLonToVector3(city.lat, city.lon, EARTH_RADIUS + 0.02);
        return (
          <group key={city.name} position={pos}>
            <mesh>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#ffd700" />
            </mesh>
            <Billboard>
              <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: "rgba(8,8,22,0.85)",
                    backdropFilter: "blur(8px)",
                    padding: "3px 10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "0.72rem",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  {city.flag} {city.name}
                </div>
              </Html>
            </Billboard>
          </group>
        );
      })}
    </>
  );
}

function FamilyMarkers({ zoomLevel }: { zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showFamily) return null;

  return (
    <>
      {FAMILY.map((member, i) => {
        const pos = latLonToVector3(member.lat, member.lon, EARTH_RADIUS + 0.03);
        const offset = new THREE.Vector3(0.04 * (i === 0 ? -1 : 1), 0.02, 0);
        pos.add(offset);
        return (
          <group key={member.name} position={pos}>
            <Billboard>
              <Html center distanceFactor={4} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    fontSize: "1.4rem",
                    filter: "drop-shadow(0 0 8px rgba(255,107,157,0.8))",
                    animation: "pulseGlow 2s ease-in-out infinite",
                  }}
                >
                  {member.emoji}
                </div>
              </Html>
            </Billboard>
            <Billboard>
              <Html center distanceFactor={4} style={{ pointerEvents: "none", marginTop: "28px" }}>
                <div
                  style={{
                    background: "rgba(255,107,157,0.15)",
                    backdropFilter: "blur(8px)",
                    padding: "4px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,107,157,0.3)",
                    color: "#ff6b9d",
                    fontSize: "0.78rem",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                    boxShadow: "0 0 20px rgba(255,107,157,0.2)",
                  }}
                >
                  {member.label}
                </div>
              </Html>
            </Billboard>
          </group>
        );
      })}
    </>
  );
}

function Graticule({ zoomLevel }: { zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showBoundaries) return null;

  const points: THREE.Vector3[] = [];
  // Latitude lines every 15°
  for (let lat = -75; lat <= 75; lat += 15) {
    for (let lon = -180; lon <= 180; lon += 3) {
      points.push(latLonToVector3(lat, lon, EARTH_RADIUS + 0.005));
    }
  }
  // Longitude lines every 15°
  for (let lon = -180; lon < 180; lon += 15) {
    for (let lat = -90; lat <= 90; lat += 3) {
      points.push(latLonToVector3(lat, lon, EARTH_RADIUS + 0.005));
    }
  }

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="rgba(255,255,255,0.06)" transparent opacity={0.4} />
    </lineSegments>
  );
}

function ParkCircle({ position, target }: { position: THREE.Vector3; target: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (ref.current) ref.current.lookAt(target);
  }, [target]);
  return (
    <mesh ref={ref} position={position}>
      <circleGeometry args={[0.03, 16]} />
      <meshBasicMaterial color="#4a7c59" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function NairobiScene({ zoomLevel }: { zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showNairobi) return null;

  const basePos = latLonToVector3(NAIROBI.lat, NAIROBI.lon, EARTH_RADIUS);
  // Local coordinate basis
  const up = basePos.clone().normalize();
  const east = new THREE.Vector3(0, 1, 0).cross(up).normalize();
  const north = up.clone().cross(east).normalize();

  // Roads
  const roadPoints: THREE.Vector3[] = [];
  for (let i = -3; i <= 3; i++) {
    // North-South roads
    for (let j = -20; j <= 20; j++) {
      const p1 = basePos.clone().add(east.clone().multiplyScalar(i * 0.08)).add(north.clone().multiplyScalar(j * 0.015));
      const p2 = basePos.clone().add(east.clone().multiplyScalar(i * 0.08)).add(north.clone().multiplyScalar((j + 1) * 0.015));
      roadPoints.push(p1, p2);
    }
    // East-West roads
    for (let j = -20; j <= 20; j++) {
      const p1 = basePos.clone().add(north.clone().multiplyScalar(i * 0.08)).add(east.clone().multiplyScalar(j * 0.015));
      const p2 = basePos.clone().add(north.clone().multiplyScalar(i * 0.08)).add(east.clone().multiplyScalar((j + 1) * 0.015));
      roadPoints.push(p1, p2);
    }
  }

  const roadGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(roadPoints), []);

  // Buildings — instanced
  const buildingCount = 120;
  const buildingGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const buildingMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const colors: number[] = [];
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
        if (Math.abs(x) < 0.5 && Math.abs(z) < 0.5) continue; // Center clearing
        if (Math.random() > 0.7) continue;
        const bx = basePos.clone().add(east.clone().multiplyScalar(x * 0.08 + (Math.random() - 0.5) * 0.02));
        bx.add(north.clone().multiplyScalar(z * 0.08 + (Math.random() - 0.5) * 0.02));
        const height = 0.01 + Math.random() * 0.06;
        const width = 0.015 + Math.random() * 0.01;
        dummy.position.copy(bx);
        dummy.position.add(up.clone().multiplyScalar(height / 2));
        dummy.scale.set(width, height, width);
        dummy.lookAt(basePos);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);
        const col = palette[Math.floor(Math.random() * palette.length)];
        meshRef.current.setColorAt(idx, col);
        idx++;
        if (idx >= buildingCount) break;
      }
      if (idx >= buildingCount) break;
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [basePos, east, north, up]);

  // Parks (green patches)
  const parkPositions = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const px = basePos.clone().add(east.clone().multiplyScalar((Math.random() - 0.5) * 0.4));
      px.add(north.clone().multiplyScalar((Math.random() - 0.5) * 0.4));
      arr.push(px);
    }
    return arr;
  }, [basePos, east, north]);

  return (
    <group>
      <lineSegments geometry={roadGeo}>
        <lineBasicMaterial color="#444444" transparent opacity={0.6} />
      </lineSegments>
      <instancedMesh ref={meshRef} args={[buildingGeo, buildingMat, buildingCount]} />
      {parkPositions.map((pos, i) => (
        <ParkCircle key={i} position={pos} target={basePos} />
      ))}
      {/* Church */}
      <mesh position={basePos.clone().add(east.clone().multiplyScalar(0.15)).add(north.clone().multiplyScalar(0.1)).add(up.clone().multiplyScalar(0.04))}>
        <boxGeometry args={[0.02, 0.08, 0.02]} />
        <meshStandardMaterial color="#e8ddd0" />
      </mesh>
      {/* School */}
      <mesh position={basePos.clone().add(east.clone().multiplyScalar(-0.12)).add(north.clone().multiplyScalar(0.15)).add(up.clone().multiplyScalar(0.025))}>
        <boxGeometry args={[0.04, 0.05, 0.025]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
    </group>
  );
}

function EmojiPeople({ zoomLevel }: { zoomLevel: number }) {
  const config = ZOOM_LEVELS[zoomLevel];
  if (!config.showNairobi) return null;

  const sprites = useMemo(() => {
    return PEOPLE.map((person) => {
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
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      return { mat, person };
    });
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const sprite = child as THREE.Sprite;
      const p = PEOPLE[i];
      if (!p || p.waypoints.length === 0) return;
      // Path following
      const cycle = (t * p.speed + p.offset) % 1;
      const segment = cycle * (p.waypoints.length - 1);
      const idx = Math.floor(segment);
      const frac = segment - idx;
      const w1 = p.waypoints[idx] || p.waypoints[0];
      const w2 = p.waypoints[Math.min(idx + 1, p.waypoints.length - 1)] || w1;
      const lat = w1[0] + (w2[0] - w1[0]) * frac;
      const lon = w1[1] + (w2[1] - w1[1]) * frac;
      const pos = latLonToVector3(lat, lon, EARTH_RADIUS + 0.04);
      // Bobbing
      pos.add(new THREE.Vector3(0, 0.02 + Math.sin(t * 3 + p.offset) * 0.008, 0));
      sprite.position.copy(pos);
      sprite.scale.setScalar(0.06);
    });
  });

  return (
    <group ref={groupRef}>
      {sprites.map((s, i) => (
        <sprite key={i} material={s.mat} />
      ))}
    </group>
  );
}

function ShootingStars({ birthdayMode }: { birthdayMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<
    { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number; maxLife: number }[]
  >([]);

  const spawnStar = useCallback(() => {
    if (!groupRef.current) return;
    const geo = new THREE.CylinderGeometry(0.003, 0.001, 0.4, 4);
    geo.rotateZ(Math.PI / 2);
    const color = birthdayMode
      ? Math.random() > 0.5
        ? "#ffd700"
        : "#ff6b9d"
      : "#ffffff";
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.4 + 0.1;
    const r = 12 + Math.random() * 8;
    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );

    const target = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 20
    );
    const velocity = target.sub(mesh.position).normalize().multiplyScalar(3 + Math.random() * 4);
    mesh.lookAt(mesh.position.clone().add(velocity));

    groupRef.current.add(mesh);
    const maxLife = 1.0 + Math.random() * 1.5;
    starsRef.current.push({ mesh, velocity, life: maxLife, maxLife });
  }, [birthdayMode]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        if (Math.random() > (birthdayMode ? 0.3 : 0.75)) spawnStar();
      },
      birthdayMode ? 3000 : 8000
    );
    return () => clearInterval(interval);
  }, [birthdayMode, spawnStar]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const toRemove: number[] = [];
    starsRef.current.forEach((star, i) => {
      star.life -= delta;
      star.mesh.position.add(star.velocity.clone().multiplyScalar(delta));
      const opacity = Math.min(1, star.life / 0.3) * Math.min(1, (star.maxLife - star.life) / 0.2);
      (star.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
      if (star.life <= 0) {
        groupRef.current?.remove(star.mesh);
        star.mesh.geometry.dispose();
        (star.mesh.material as THREE.MeshBasicMaterial).dispose();
        toRemove.push(i);
      }
    });
    starsRef.current = starsRef.current.filter((_, i) => !toRemove.includes(i));
  });

  return <group ref={groupRef} />;
}

function SceneBackground({ sunAltitude }: { sunAltitude: number }) {
  const { scene } = useThree();
  const dayColor = useMemo(() => new THREE.Color("#0a1a2e"), []);
  const nightColor = useMemo(() => new THREE.Color("#030308"), []);

  useEffect(() => {
    if (!scene.background) {
      scene.background = new THREE.Color("#030308");
    }
  }, [scene]);

  useFrame(() => {
    if (!scene.background) return;
    const target = sunAltitude > -5 ? dayColor : nightColor;
    (scene.background as THREE.Color).lerp(target, 0.02);
    scene.fog = new THREE.FogExp2(scene.background as THREE.Color, 0.015);
  });

  return null;
}

/* ─── SCENE COMPOSER ─── */
function UniverseScene({
  settings,
  zoomLevel,
  kenyaTime,
  onCountryClick,
  birthdayMode,
}: {
  settings: Settings;
  zoomLevel: number;
  kenyaTime: Date;
  onCountryClick: (lat: number, lon: number) => void;
  birthdayMode: boolean;
}) {
  const sunDir = useMemo(() => getSunDirection(kenyaTime), [kenyaTime]);
  const moonPos = useMemo(() => getMoonPosition(kenyaTime), [kenyaTime]);
  const sunAlt = useMemo(() => {
    const { altitude } = getSunAltitudeAzimuth(kenyaTime, NAIROBI.lat, NAIROBI.lon);
    return altitude;
  }, [kenyaTime]);

  const [textures, setTextures] = useState<{
    day?: THREE.Texture;
    night?: THREE.Texture;
    cloud?: THREE.Texture;
    bump?: THREE.Texture;
  }>({});

  useEffect(() => {
    const day = generateDayTexture();
    const night = generateNightTexture();
    const cloud = generateCloudTexture();
    const bump = generateBumpTexture();
    setTextures({ day, night, cloud, bump });
  }, []);

  // Earth rotation: real sidereal rotation + offset to face Kenya
  const rotationOffset = useMemo(() => {
    // Kenya is at ~37°E. We want that facing the camera at default.
    // Earth's rotation: 360° per sidereal day (23h 56m)
    const jd = kenyaTime.getTime() / 86400000.0 + 2440587.5;
    const n = jd - 2451545.0;
    const earthRotation = (n * 360.9856) % 360;
    const kenyaLon = 37;
    return ((earthRotation - kenyaLon) % 360) / 360;
  }, [kenyaTime]);

  return (
    <>
      <SceneBackground sunAltitude={sunAlt} />
      <ambientLight intensity={0.15} />
      <directionalLight position={sunDir.clone().multiplyScalar(20).toArray()} intensity={1.8} color="#fff8e7" />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#8b5cf6" distance={50} />
      <pointLight position={[0, -10, 5]} intensity={0.3} color="#00d4ff" distance={30} />

      <EarthMesh
        textures={textures}
        sunDirection={sunDir}
        settings={settings}
        rotationOffset={rotationOffset}
        onClick={onCountryClick}
      />
      <AtmosphereMesh sunDirection={sunDir} settings={settings} />
      <CloudMesh texture={textures.cloud} settings={settings} />
      <MoonMesh position={moonPos} />
      <SunMesh direction={sunDir} />
      <CityMarkers cities={CITIES} zoomLevel={zoomLevel} />
      <FamilyMarkers zoomLevel={zoomLevel} />
      <Graticule zoomLevel={zoomLevel} />
      <NairobiScene zoomLevel={zoomLevel} />
      <EmojiPeople zoomLevel={zoomLevel} />
      <ShootingStars birthdayMode={birthdayMode} />

      {/* Stars background — only visible at night */}
      <Stars visible={sunAlt < 5} />
    </>
  );
}

/* ─── STARS COMPONENT (custom, fades with day) ─── */
function Stars({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const [positions, colors] = useMemo(() => {
    const count = 6000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const brightness = 0.5 + Math.random() * 0.5;
      col[i * 3] = brightness;
      col[i * 3 + 1] = brightness;
      col[i * 3 + 2] = brightness;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.005;
      (ref.current.material as THREE.PointsMaterial).opacity = visible ? 0.8 : 0.0;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

/* ─── MAIN EXPORT ─── */
export default function Universe3D() {
  const [kenyaTime, setKenyaTime] = useState<Date>(getKenyaTime());
  const [zoomLevel, setZoomLevel] = useState(2);
  const [settings, setSettings] = useState<Settings>({
    dayNightShader: true,
    cityLights: true,
    clouds: true,
    atmosphere: true,
    autoReturn: true,
    labels: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    country: "",
    flag: "",
    lat: 0,
    lon: 0,
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);
  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Kenya time updater
  useEffect(() => {
    const interval = setInterval(() => setKenyaTime(getKenyaTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Birthday mode check
  const birthdayMode = useMemo(() => {
    const k = kenyaTime;
    return k.getMonth() === 5 && k.getDate() === 1; // June 1
  }, [kenyaTime]);

  // Sun/moon info
  const sunInfo = useMemo(() => {
    const { altitude, azimuth } = getSunAltitudeAzimuth(kenyaTime, NAIROBI.lat, NAIROBI.lon);
    let status = "Night";
    if (altitude > 5) status = "Day";
    else if (altitude > -5) status = altitude > 0 ? "Sunset" : "Twilight";
    else if (altitude > -12) status = "Nautical Twilight";
    return { altitude: altitude.toFixed(1), azimuth: azimuth.toFixed(1), status };
  }, [kenyaTime]);

  const moonInfo = useMemo(() => getMoonPhaseInfo(kenyaTime), [kenyaTime]);

  // Zoom handling
  const handleZoom = useCallback(
    (delta: number) => {
      setZoomLevel((prev) => Math.max(0, Math.min(3, prev + delta)));
    },
    []
  );

  // Country click
  const handleCountryClick = useCallback((lat: number, lon: number) => {
    const country = findCountry(lat, lon);
    if (country) {
      setTooltip({
        visible: true,
        x: 0,
        y: 0,
        country: country.name,
        flag: country.flag,
        lat,
        lon,
      });
      setTimeout(() => setTooltip((t) => ({ ...t, visible: false })), 4000);
    }
    // Check if near a city
    for (const city of CITIES) {
      const d = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2));
      if (d < 2 && city.name === "Nairobi") {
        setZoomLevel(3); // Zoom to family view
        break;
      }
    }
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
        // Smooth return to Kenya-facing view
        const target = latLonToVector3(NAIROBI.lat, NAIROBI.lon, ZOOM_LEVELS[zoomLevel].cameraPos[2]);
        // We'll let the user manually return; auto-return via OrbitControls autoRotate
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
  }, [settings.autoReturn, zoomLevel]);

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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Africa/Nairobi",
    });
  };

  return (
    <div className="universe-view" ref={canvasContainerRef}>
      {/* 3D Canvas */}
      <div className="universe-canvas-container">
        <Canvas
          camera={{
            position: ZOOM_LEVELS[zoomLevel].cameraPos,
            fov: 55,
            near: 0.1,
            far: 1000,
          }}
          gl={{ antialias: true, alpha: false, pixelRatio: Math.min(window.devicePixelRatio, 2) }}
        >
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={ZOOM_LEVELS[zoomLevel].minD}
            maxDistance={ZOOM_LEVELS[zoomLevel].maxD}
            autoRotate={false}
            autoRotateSpeed={0.5}
            dampingFactor={0.08}
            enableDamping
            rotateSpeed={0.6}
            zoomSpeed={0.8}
          />
          <UniverseScene
            settings={settings}
            zoomLevel={zoomLevel}
            kenyaTime={kenyaTime}
            onCountryClick={handleCountryClick}
            birthdayMode={birthdayMode}
          />
        </Canvas>
      </div>

      {/* Header — Time & Info */}
      <div className="universe-header">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>
          <span style={{ background: "linear-gradient(135deg, #c084fc, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🌍 The Universe — For Dal
          </span>
        </h2>
        <div style={{ fontSize: "0.78rem", color: "var(--lunar)", marginBottom: 8 }}>
          {formatDate(kenyaTime)}
        </div>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "white", letterSpacing: "-0.02em", marginBottom: 6 }}>
          {formatKenyaTime(kenyaTime)}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--lunar)", marginBottom: 10 }}>
          Nairobi, Kenya · UTC+3 · No DST
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #ffd700, #ff8c00)", boxShadow: "0 0 10px rgba(255,215,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>
            ☀️
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--lunar)", lineHeight: 1.4 }}>
            <div style={{ color: "white", fontWeight: 500 }}>{sunInfo.status}</div>
            <div>Alt: {sunInfo.altitude}° · Az: {sunInfo.azimuth}°</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #e8e8e8, #a0a0c0)", boxShadow: "0 0 10px rgba(224,224,224,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>
            🌙
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--lunar)", lineHeight: 1.4 }}>
            <div style={{ color: "white", fontWeight: 500 }}>{moonInfo.phase}</div>
            <div>Age: {moonInfo.age.toFixed(1)}d · Illum: {moonInfo.illum.toFixed(0)}%</div>
          </div>
        </div>

        {birthdayMode && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,107,157,0.12)", borderRadius: 10, border: "1px solid rgba(255,107,157,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#ff6b9d", fontWeight: 600 }}>
              🎉 Happy Birthday Dal! 🎂
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--lunar)", marginTop: 2 }}>
              The stars are shining just for you today
            </div>
          </div>
        )}
      </div>

      {/* Settings Dropdown */}
      <div className="universe-controls">
        <div style={{ position: "relative" }}>
          <button
            className="action-btn"
            onClick={() => setSettingsOpen(!settingsOpen)}
            style={{ width: 40, height: 40, borderRadius: "50%", padding: 0, justifyContent: "center" }}
          >
            ⚙️
          </button>
          {settingsOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: 220,
                background: "rgba(8, 8, 22, 0.9)",
                backdropFilter: "blur(24px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                zIndex: 200,
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--lunar)", marginBottom: 4 }}>
                Settings
              </div>
              {[
                { key: "dayNightShader" as keyof Settings, icon: "🌗", label: "Day/Night" },
                { key: "cityLights" as keyof Settings, icon: "🏙️", label: "City Lights" },
                { key: "clouds" as keyof Settings, icon: "☁️", label: "Clouds" },
                { key: "atmosphere" as keyof Settings, icon: "🌈", label: "Atmosphere" },
                { key: "autoReturn" as keyof Settings, icon: "🔄", label: "Auto-Return" },
                { key: "labels" as keyof Settings, icon: "🏷️", label: "Labels" },
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

      {/* Bottom Actions */}
      <div className="universe-actions">
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "8px 16px" }}>
          <button
            className="action-btn"
            onClick={() => handleZoom(-1)}
            style={{ width: 36, height: 36, borderRadius: "50%", padding: 0, justifyContent: "center", fontSize: "1.2rem", fontWeight: 700 }}
          >
            −
          </button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80 }}>
            <span style={{ fontSize: "0.72rem", color: "var(--lunar)" }}>Zoom</span>
            <span style={{ fontSize: "0.82rem", color: "white", fontWeight: 600 }}>{ZOOM_LEVELS[zoomLevel].name}</span>
          </div>
          <button
            className="action-btn"
            onClick={() => handleZoom(1)}
            style={{ width: 36, height: 36, borderRadius: "50%", padding: 0, justifyContent: "center", fontSize: "1.2rem", fontWeight: 700 }}
          >
            +
          </button>
        </div>

        <button className="action-btn" onClick={() => setSettings((s) => ({ ...s, dayNightShader: !s.dayNightShader }))}>
          <span>{sunInfo.altitude > 0 ? "🌙" : "☀️"}</span>
          <span>{sunInfo.altitude > 0 ? "Night View" : "Day View"}</span>
        </button>

        <button className="action-btn" onClick={() => setZoomLevel(3)}>
          <span>💕</span>
          <span>Family</span>
        </button>

        <button className="action-btn" onClick={() => setZoomLevel(0)}>
          <span>🌌</span>
          <span>Constellations</span>
        </button>
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          left: 24,
          bottom: 100,
          zIndex: 10,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 14,
          minWidth: 150,
        }}
      >
        <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--lunar)", marginBottom: 10 }}>
          Legend
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "var(--stardust)", marginBottom: 8 }}>
          <span style={{ fontSize: "1rem" }}>🟡</span>
          <span>Major City</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "var(--stardust)", marginBottom: 8 }}>
          <span style={{ fontSize: "1rem" }}>💕</span>
          <span>Family</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "var(--stardust)", marginBottom: 8 }}>
          <span style={{ fontSize: "1rem" }}>☀️</span>
          <span>Sun</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.78rem", color: "var(--stardust)" }}>
          <span style={{ fontSize: "1rem" }}>🌙</span>
          <span>Moon</span>
        </div>
      </div>

      {/* Country Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "30%",
            transform: "translateX(-50%)",
            background: "rgba(8, 8, 22, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "14px 22px",
            zIndex: 300,
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            textAlign: "center",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div style={{ fontSize: "1.6rem", marginBottom: 4 }}>{tooltip.flag}</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: 4 }}>{tooltip.country}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--lunar)" }}>
            {tooltip.lat.toFixed(2)}°, {tooltip.lon.toFixed(2)}°
          </div>
        </div>
      )}
    </div>
  );
}
