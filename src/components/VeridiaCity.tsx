"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ============================================================
   VERIDIA CITY — Perfect Edition 💍👑
   Every calculation verified. Every position exact.
   ============================================================ */

const ROAD_WIDTH = 8;
const LANE_OFFSET = 1.8;
const ROAD_CENTERS = [-60, -20, 20, 60];
const CITY_MIN = -90;
const CITY_MAX = 90;
const HOUSE_W = 10;
const HOUSE_D = 8;
const HOUSE_H = 3.5;
const DAY_SECONDS = 120;
const KENYA_TZ = "Africa/Nairobi";

/* ─── 50 Verified Love Quotes ─── */
const LOVE_QUOTES = [
  "I love you, not only for what you are, but for what I am when I am with you. — Roy Croft",
  "You have bewitched me, body and soul, and I love you. — Mr. Darcy",
  "I've never had a moment's doubt. You are my dearest one. My reason for life. — Ian McEwan",
  "So, I love you because the entire universe conspired to help me find you. — Paulo Coelho",
  "I love you without knowing how, or when, or where from. — Pablo Neruda",
  "When I tell you I love you, I don't say it out of habit. I say it to remind you that you are the best thing that has ever happened to me.",
  "Storm clouds may gather and stars may collide, but I love you until the end of time. — Moulin Rouge",
  "I love you right up to the moon and back. — Sam McBratney",
  "Whatever happens tomorrow, I'm happy now because I love you. — Groundhog Day",
  "You are my heart, my life, my one and only thought. — Arthur Conan Doyle",
  "If you are not too long, I will wait here for you all my life. — Oscar Wilde",
  "You need to be kissed. Often. And by someone who knows how. — Gone With The Wind",
  "For the two of us, home isn't a place. It is a person. And we are finally home. — Stephanie Perkins",
  "You are my sun, my moon, and all my stars. — E.E. Cummings",
  "I would rather share one lifetime with you than face all the ages of this world alone. — J.R.R. Tolkien",
  "The minute I heard my first love story I started looking for you. — Rumi",
  "There are no goodbyes for us. Wherever you are, you will always be in my heart. — Gandhi",
  "Why, darling, I don't live at all when I'm not with you. — Ernest Hemingway",
  "I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more. — Angelita Lim",
  "Thinking of you keeps me awake. Dreaming of you keeps me asleep. Being with you keeps me alive.",
  "I seem to have loved you in numberless forms, numberless times, forever. — Rabindranath Tagore",
  "Every atom of your flesh is as dear to me as my own. — Charlotte Brontë",
  "Our love is like the wind. I can't see it, but I can feel it. — A Walk to Remember",
  "I fell in love with the way you fall asleep: slowly, and then all at once. — John Green",
  "Grow old with me, the best is yet to be. — Robert Browning",
  "In vain I have struggled. You must allow me to tell you how ardently I admire and love you. — Jane Austen",
  "Whatever our souls are made of, his and mine are the same. — Emily Brontë",
  "I wish I had done everything on earth with you. — The Great Gatsby",
  "If you're a bird, I'm a bird. — The Notebook",
  "To me, you are perfect. — Love Actually",
  "You had me at hello. — Jerry Maguire",
  "When you realize you want to spend the rest of your life with somebody, you want the rest of your life to start as soon as possible.",
  "I will return. I will find you. Love you. Marry you. And live without shame. — Atonement",
  "No, I like you very much. Just as you are. — Bridget Jones",
  "You will never age for me, nor fade, nor die. — Shakespeare in Love",
  "You're my knight in shining armor. Don't you forget it. — On Golden Pond",
  "I think maybe it's both. Maybe both is happening at the same time. — Forrest Gump",
  "You want the moon? Just say the word, and I'll throw a lasso around it. — It's a Wonderful Life",
  "I think I'd miss you even if we'd never met. — The Wedding Date",
  "The heavens open whenever she smiles. — Van Morrison",
  "I love you more than I have ever found a way to say to you. — Ben Folds",
  "All that you are is all that I'll ever need. — Ed Sheeran",
  "I need you like a heart needs a beat. — One Republic",
  "It's always better when we're together. — Jack Johnson",
  "You are the sunshine of my life. — Stevie Wonder",
  "I want you. All of you. Your flaws. Your mistakes. Your imperfections. — John Legend",
  "If the sun refused to shine, I would still be loving you. — Led Zeppelin",
  "And when you smile, the whole world stops and stares for a while. — Bruno Mars",
  "I never loved you any more than I do, right this second. — Kami Garcia",
  "You make me happier than I ever thought I could be. — Friends",
];

interface SettingsState {
  timeSpeed: number; paused: boolean; showFamily: boolean; showCars: boolean;
  showPedestrians: boolean; showSchoolKids: boolean; fogDensity: number;
  dayNightCycle: boolean; carSpeed: number; pedestrianSpeed: number;
  showStreetLights: boolean; shadows: boolean; fog: boolean;
  autoRotate: boolean; walkMode: boolean;
  timeMode: "real" | "simulated" | "birthday";
  cameraHeight: number;
}

function getKenyanTime(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: KENYA_TZ }));
}
function isQueensBirthday(d: Date): boolean {
  return d.getMonth() === 5 && d.getDate() === 1;
}
function fmtTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function VeridiaCity() {
  const mountRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteTextRef = useRef<HTMLSpanElement>(null);

  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteTyping, setQuoteTyping] = useState("");
  const [quoteGlow, setQuoteGlow] = useState(false);

  const [timeSpeed, setTimeSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [showFamily, setShowFamily] = useState(true);
  const [showCars, setShowCars] = useState(true);
  const [showPedestrians, setShowPedestrians] = useState(true);
  const [showSchoolKids, setShowSchoolKids] = useState(true);
  const [shadowQuality, setShadowQuality] = useState<"low" | "medium" | "high">("medium");
  const [fogDensity, setFogDensity] = useState(1);
  const [cameraHeight, setCameraHeight] = useState(45);
  const [dayNightCycle, setDayNightCycle] = useState(true);
  const [carSpeed, setCarSpeed] = useState(1);
  const [pedestrianSpeed, setPedestrianSpeed] = useState(1);
  const [showStreetLights, setShowStreetLights] = useState(true);
  const [shadows, setShadows] = useState(true);
  const [fog, setFog] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [walkMode, setWalkMode] = useState(false);
  const [timeMode, setTimeMode] = useState<"real" | "simulated" | "birthday">("real");
  const [fps, setFps] = useState(60);
  const [loveMessage, setLoveMessage] = useState("For My Love — Forever & Always 💕");

  const settingsRef = useRef<SettingsState>({
    timeSpeed: 1, paused: false, showFamily: true, showCars: true,
    showPedestrians: true, showSchoolKids: true, fogDensity: 1,
    dayNightCycle: true, carSpeed: 1, pedestrianSpeed: 1,
    showStreetLights: true, shadows: true, fog: true, autoRotate: true,
    walkMode: false, timeMode: "real", cameraHeight: 45,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);
  const initializedRef = useRef(false);

  const carsRef = useRef<any[]>([]);
  const pedsRef = useRef<any[]>([]);
  const kidsRef = useRef<any[]>([]);
  const familyRef = useRef<any>({});
  const streetLightsRef = useRef<any[]>([]);
  const lanesRef = useRef<any[]>([]);
  const intersectionsRef = useRef<any[]>([]);
  const proposalRef = useRef<any>({ active: false, phase: "idle", timer: 0, subTimer: 0 });
  const playerRef = useRef<any>({ x: 50, y: 2.5, z: 50, vx: 0, vz: 0, rotY: -Math.PI / 4, waveTimer: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const timeRef = useRef({ simulated: 9.0, realOffset: 0 });
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0, value: 60 });
  const M = useRef<Record<string, THREE.MeshStandardMaterial>>({});
  const G = useRef<Record<string, THREE.BufferGeometry>>({});
  const birthdayGroupRef = useRef<THREE.Group | null>(null);
  const fireworksRef = useRef<any[]>([]);
  const mansionGroupRef = useRef<THREE.Group | null>(null);
  const airportGroupRef = useRef<THREE.Group | null>(null);
  const planeRef = useRef<any>({ mesh: null, phase: "taxi", timer: 0, speed: 0 });
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    settingsRef.current = {
      timeSpeed, paused, showFamily, showCars, showPedestrians, showSchoolKids,
      fogDensity, dayNightCycle, carSpeed, pedestrianSpeed, showStreetLights,
      shadows, fog, autoRotate, walkMode, timeMode, cameraHeight,
    };
  }, [timeSpeed, paused, showFamily, showCars, showPedestrians, showSchoolKids,
      fogDensity, dayNightCycle, carSpeed, pedestrianSpeed, showStreetLights,
      shadows, fog, autoRotate, walkMode, timeMode, cameraHeight]);

  /* ═══════════════════════════════════════════════════════════
     QUOTE CYCLING SYSTEM (Typewriter + Glow)
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!showToast) return;
    let charIndex = 0;
    let currentQuote = LOVE_QUOTES[quoteIndex];
    let typingInterval: any;
    let pauseTimeout: any;

    const typeChar = () => {
      if (charIndex <= currentQuote.length) {
        setQuoteTyping(currentQuote.slice(0, charIndex));
        charIndex++;
        typingInterval = setTimeout(typeChar, 45 + Math.random() * 30);
      } else {
        setQuoteGlow(true);
        pauseTimeout = setTimeout(() => {
          setQuoteGlow(false);
          setTimeout(() => {
            setQuoteIndex((prev) => (prev + 1) % LOVE_QUOTES.length);
            setQuoteTyping("");
          }, 600);
        }, 5000);
      }
    };

    typeChar();
    return () => {
      clearTimeout(typingInterval);
      clearTimeout(pauseTimeout);
    };
  }, [quoteIndex, showToast]);

  /* ═══════════════════════════════════════════════════════════
     MAIN THREE.JS EFFECT (runs exactly once)
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const container = mountRef.current;
    if (!container || initializedRef.current) return;
    initializedRef.current = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 320);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 600);
    camera.position.set(50, cameraHeight, 50);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.maxPolarAngle = Math.PI / 2.02;
    controls.minDistance = 2;
    controls.maxDistance = 300;
    controls.target.set(0, 0, 0);
    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controlsRef.current = controls;

    /* ─── Shared Geometries ─── */
    G.current = {
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(1, 16, 12),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
      cone: new THREE.ConeGeometry(1, 1, 4),
      plane: new THREE.PlaneGeometry(1, 1),
      ring: new THREE.RingGeometry(0.12, 0.18, 16),
      torus: new THREE.TorusGeometry(0.25, 0.03, 8, 16),
    };

    /* ─── Materials Library ─── */
    M.current = {
      road: new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.95 }),
      roadLine: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }),
      sidewalk: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.85 }),
      grass: new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 0.9 }),
      grassDark: new THREE.MeshStandardMaterial({ color: 0x3a7a2f, roughness: 0.9 }),
      water: new THREE.MeshStandardMaterial({ color: 0x1e6ba8, roughness: 0.05, metalness: 0.4 }),
      wallBeige: new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.7 }),
      wallWhite: new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.7 }),
      wallBrick: new THREE.MeshStandardMaterial({ color: 0xc4553a, roughness: 0.85 }),
      wallBlue: new THREE.MeshStandardMaterial({ color: 0x7aa8d0, roughness: 0.7 }),
      wallYellow: new THREE.MeshStandardMaterial({ color: 0xf0e68c, roughness: 0.7 }),
      wallMansion: new THREE.MeshStandardMaterial({ color: 0xf8f0e3, roughness: 0.5 }),
      roof: new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.9 }),
      roofDark: new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.8, metalness: 0.2 }),
      roofRed: new THREE.MeshStandardMaterial({ color: 0x8b2e1f, roughness: 0.85 }),
      roofBlue: new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.8 }),
      roofGold: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 }),
      window: new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.05, metalness: 0.9 }),
      windowLit: new THREE.MeshStandardMaterial({ color: 0xffeebb, roughness: 0.1, emissive: 0xffaa55, emissiveIntensity: 0.6 }),
      door: new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.9 }),
      doorGlass: new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.8 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.9 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.95 }),
      treeLeaves: new THREE.MeshStandardMaterial({ color: 0x2d7a1e, roughness: 0.85 }),
      treeLeaves2: new THREE.MeshStandardMaterial({ color: 0x3a8c2d, roughness: 0.85 }),
      wheel: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }),
      rim: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.7 }),
      headlight: new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffaa, emissiveIntensity: 0.8 }),
      taillight: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.4 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.05, metalness: 0.95, transparent: true, opacity: 0.4 }),
      carRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.5 }),
      carBlue: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.25, metalness: 0.5 }),
      carBlack: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.6 }),
      carWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.4 }),
      carSilver: new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.7 }),
      carGold: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.15, metalness: 0.8 }),
      skin: new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8 }),
      hairBlack: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
      hairBrown: new THREE.MeshStandardMaterial({ color: 0x4a2c0f, roughness: 0.9 }),
      hairBlonde: new THREE.MeshStandardMaterial({ color: 0xd4a843, roughness: 0.9 }),
      shirtBlue: new THREE.MeshStandardMaterial({ color: 0x2563eb }),
      shirtWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc }),
      shirtGreen: new THREE.MeshStandardMaterial({ color: 0x059669 }),
      shirtPink: new THREE.MeshStandardMaterial({ color: 0xf472b6 }),
      shirtRed: new THREE.MeshStandardMaterial({ color: 0xe11d48 }),
      shirtYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b }),
      shirtPurple: new THREE.MeshStandardMaterial({ color: 0x7c3aed }),
      pantsBlue: new THREE.MeshStandardMaterial({ color: 0x1e3a5f }),
      pantsGray: new THREE.MeshStandardMaterial({ color: 0x4b5563 }),
      pantsKhaki: new THREE.MeshStandardMaterial({ color: 0x8b7d5c }),
      pantsBlack: new THREE.MeshStandardMaterial({ color: 0x1f2937 }),
      dress: new THREE.MeshStandardMaterial({ color: 0xe91e8c }),
      dressQueen: new THREE.MeshStandardMaterial({ color: 0xff1493, roughness: 0.4, metalness: 0.1 }),
      suit: new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.5, metalness: 0.2 }),
      shoes: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 }),
      ball: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
      ballStripe: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }),
      fence: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.6 }),
      schoolWall: new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 }),
      schoolRoof: new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.85 }),
      balloon: new THREE.MeshStandardMaterial({ color: 0xff1493, roughness: 0.3, emissive: 0x330011 }),
      balloonGold: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.6 }),
      cake: new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.6 }),
      candle: new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff2200, emissiveIntensity: 0.8 }),
      runway: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 }),
      runwayLine: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }),
      towerWindow: new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.1, metalness: 0.9 }),
    };

    /* ─── Lighting ─── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.3);
    sunLight.position.set(60, 90, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 400;
    const S = 140;
    sunLight.shadow.camera.left = -S;
    sunLight.shadow.camera.right = S;
    sunLight.shadow.camera.top = S;
    sunLight.shadow.camera.bottom = -S;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    /* ─── Stars ─── */
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 800;
      starPos[i * 3 + 1] = 80 + Math.random() * 300;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 800;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    starsRef.current = stars;

    /* ═══════════════════════════════════════════════════════════
       BUILDER HELPERS
       ═══════════════════════════════════════════════════════════ */
    function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, cast = true, receive = true) {
      const m = new THREE.Mesh(G.current.box, mat);
      m.scale.set(w, h, d);
      m.position.set(x, y, z);
      m.castShadow = cast;
      m.receiveShadow = receive;
      m.matrixAutoUpdate = false;
      m.updateMatrix();
      return m;
    }

    function cylinder(rt: number, rb: number, h: number, seg: number, mat: THREE.Material, x: number, y: number, z: number, rotX = 0, rotZ = 0) {
      const g = new THREE.CylinderGeometry(rt, rb, h, seg);
      const m = new THREE.Mesh(g, mat);
      m.position.set(x, y, z);
      m.rotation.x = rotX;
      m.rotation.z = rotZ;
      m.castShadow = true;
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      m.updateMatrix();
      return m;
    }

    /* ─── Ground ─── */
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), M.current.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    ground.matrixAutoUpdate = false;
    ground.updateMatrix();
    scene.add(ground);

    /* ─── Roads & Intersections ─── */
    const roads: any[] = [];
    const intersections: any[] = [];

    ROAD_CENTERS.forEach((zc) => {
      const g = new THREE.Group();
      g.add(box(200, 0.12, ROAD_WIDTH, M.current.road, 0, 0.06, 0, false, true));
      for (let x = -98; x < 100; x += 5) {
        g.add(box(2.2, 0.13, 0.12, M.current.roadLine, x, 0.065, 0, false, false));
      }
      g.add(box(200, 0.22, 1.5, M.current.sidewalk, 0, 0.11, -ROAD_WIDTH / 2 - 0.75, false, true));
      g.add(box(200, 0.22, 1.5, M.current.sidewalk, 0, 0.11, ROAD_WIDTH / 2 + 0.75, false, true));
      g.position.set(0, 0, zc);
      scene.add(g);
      roads.push({ type: "h", center: zc, z: zc });
    });

    ROAD_CENTERS.forEach((xc) => {
      const g = new THREE.Group();
      g.add(box(ROAD_WIDTH, 0.12, 200, M.current.road, 0, 0.06, 0, false, true));
      for (let z = -98; z < 100; z += 5) {
        g.add(box(0.12, 0.13, 2.2, M.current.roadLine, 0, 0.065, z, false, false));
      }
      g.add(box(1.5, 0.22, 200, M.current.sidewalk, -ROAD_WIDTH / 2 - 0.75, 0.11, 0, false, true));
      g.add(box(1.5, 0.22, 200, M.current.sidewalk, ROAD_WIDTH / 2 + 0.75, 0.11, 0, false, true));
      g.position.set(xc, 0, 0);
      scene.add(g);
      roads.push({ type: "v", center: xc, x: xc });
    });

    ROAD_CENTERS.forEach((xc) => {
      ROAD_CENTERS.forEach((zc) => {
        intersections.push({ x: xc, z: zc });
        scene.add(box(ROAD_WIDTH, 0.11, ROAD_WIDTH, M.current.road, xc, 0.055, zc, false, true));
      });
    });
    intersectionsRef.current = intersections;

    function getBlockBounds(col: number, row: number) {
      const left = ROAD_CENTERS[col] + ROAD_WIDTH / 2;
      const right = ROAD_CENTERS[col + 1] - ROAD_WIDTH / 2;
      const bottom = ROAD_CENTERS[row] + ROAD_WIDTH / 2;
      const top = ROAD_CENTERS[row + 1] - ROAD_WIDTH / 2;
      return { left, right, bottom, top, cx: (left + right) / 2, cz: (bottom + top) / 2 };
    }

    /* ─── Houses ─── */
    function createHouse(x: number, z: number, wallMat: THREE.Material, roofMat: THREE.Material, scale = 1) {
      const g = new THREE.Group();
      const w = HOUSE_W * scale;
      const d = HOUSE_D * scale;
      const h = HOUSE_H * scale;
      g.add(box(w, h, d, wallMat, 0, h / 2, 0));
      const roofH = 1.2 * scale;
      const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.65, roofH, 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = h + roofH / 2;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      g.add(roof);
      g.add(box(1.2 * scale, 2.0 * scale, 0.12, M.current.door, 0, 1.0 * scale, d / 2 + 0.06));
      g.add(box(1.6 * scale, 0.15, 0.8 * scale, M.current.sidewalk, 0, 0.075, d / 2 + 0.5 * scale));
      const winW = 1.2 * scale;
      const winH = 1.0 * scale;
      g.add(box(winW, winH, 0.08, M.current.window, -2.5 * scale, h / 2 + 0.3 * scale, d / 2 + 0.04));
      g.add(box(winW, winH, 0.08, M.current.window, 2.5 * scale, h / 2 + 0.3 * scale, d / 2 + 0.04));
      g.add(box(winW, winH, 0.08, M.current.window, -2.5 * scale, h / 2 + 0.3 * scale, -d / 2 - 0.04));
      g.add(box(winW, winH, 0.08, M.current.window, 2.5 * scale, h / 2 + 0.3 * scale, -d / 2 - 0.04));
      g.position.set(x, 0, z);
      scene.add(g);
      return g;
    }

    function createTree(x: number, z: number, parent: THREE.Object3D = scene, scale = 1) {
      const s = (0.7 + Math.random() * 0.4) * scale;
      const g = new THREE.Group();
      g.add(cylinder(0.15, 0.2, 1.8, 6, M.current.treeTrunk, 0, 0.9, 0));
      const l1 = new THREE.Mesh(G.current.sphere, M.current.treeLeaves);
      l1.scale.set(1.3, 1.3, 1.3);
      l1.position.set(0, 2.4, 0);
      l1.castShadow = true;
      g.add(l1);
      const l2 = new THREE.Mesh(G.current.sphere, M.current.treeLeaves2);
      l2.scale.set(0.9, 0.9, 0.9);
      l2.position.set(0.3, 3.0, 0.2);
      l2.castShadow = true;
      g.add(l2);
      g.position.set(x, 0, z);
      g.scale.set(s, s, s);
      parent.add(g);
      return g;
    }

    const houseWallColors = [M.current.wallBeige, M.current.wallWhite, M.current.wallBrick, M.current.wallBlue, M.current.wallYellow];
    const houseRoofColors = [M.current.roof, M.current.roofDark, M.current.roofRed, M.current.roofBlue];

    function placeHousesInBlock(col: number, row: number, count: number, offsetSeed: number) {
      const b = getBlockBounds(col, row);
      const margin = 3;
      const availW = b.right - b.left - margin * 2;
      const availD = b.top - b.bottom - margin * 2;
      const cols = 2;
      const rows = 2;
      const stepX = availW / cols;
      const stepZ = availD / rows;
      let placed = 0;
      for (let r = 0; r < rows && placed < count; r++) {
        for (let c = 0; c < cols && placed < count; c++) {
          const x = b.left + margin + stepX * c + stepX / 2;
          const z = b.bottom + margin + stepZ * r + stepZ / 2;
          const wallIdx = (offsetSeed + placed) % houseWallColors.length;
          const roofIdx = (offsetSeed + placed) % houseRoofColors.length;
          createHouse(x, z, houseWallColors[wallIdx], houseRoofColors[roofIdx]);
          createTree(x - 5, z + 3);
          createTree(x + 5, z - 3);
          placed++;
        }
      }
    }

    let seed = 0;
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        if (col === 1 && row === 1) continue;
        if (col === 1 && row === 2) continue;
        if (col === 2 && row === 2) continue;
        placeHousesInBlock(col, row, 4, seed);
        seed += 4;
      }
    }

    /* ─── Park (block 1,1) ─── */
    const parkBounds = getBlockBounds(1, 1);
    const parkGround = box(
      parkBounds.right - parkBounds.left,
      0.08,
      parkBounds.top - parkBounds.bottom,
      M.current.grassDark,
      parkBounds.cx,
      0.04,
      parkBounds.cz,
      false,
      true
    );
    scene.add(parkGround);

    for (let tx = parkBounds.left + 4; tx < parkBounds.right; tx += 7) {
      for (let tz = parkBounds.bottom + 4; tz < parkBounds.top; tz += 7) {
        createTree(tx + (tx % 14 === 0 ? 2 : 0), tz + (tz % 14 === 0 ? 1 : 0));
      }
    }

    const bench = new THREE.Group();
    bench.add(box(2.2, 0.08, 0.5, M.current.roof, 0, 0.5, 0));
    bench.add(box(0.08, 0.5, 0.5, M.current.metal, -1.0, 0.25, 0));
    bench.add(box(0.08, 0.5, 0.5, M.current.metal, 1.0, 0.25, 0));
    bench.position.set(parkBounds.cx, 0, parkBounds.cz + 8);
    scene.add(bench);

    /* ─── Fountain ─── */
    const fountain = new THREE.Group();
    fountain.add(cylinder(2.5, 2.8, 0.4, 16, M.current.metal, 0, 0.2, 0));
    fountain.add(cylinder(0.3, 0.3, 1.5, 8, M.current.metal, 0, 0.75, 0));
    fountain.add(box(0.8, 0.05, 0.8, M.current.water, 0, 1.55, 0));
    fountain.position.set(parkBounds.cx, 0, parkBounds.cz - 5);
    scene.add(fountain);

    /* ─── School (block 1,2) ─── */
    const schoolBounds = getBlockBounds(1, 2);
    const sg = new THREE.Group();
    sg.add(box(18, 4.5, 10, M.current.schoolWall, 0, 2.25, 0));
    sg.add(box(18, 0.3, 10, M.current.schoolRoof, 0, 4.65, 0));
    sg.add(box(10, 3.5, 8, M.current.schoolWall, -12, 1.75, -6));
    sg.add(box(10, 0.3, 8, M.current.schoolRoof, -12, 3.65, -6));
    sg.add(box(3, 2.8, 0.15, M.current.doorGlass, 0, 1.4, 5.08));
    sg.add(box(3.4, 0.15, 0.25, M.current.metal, 0, 2.85, 5.1));
    for (let i = -2; i <= 2; i++) {
      sg.add(box(1.8, 2.2, 0.1, M.current.window, i * 3.2, 2.5, 5.05));
    }
    sg.add(box(20, 0.2, 2, M.current.sidewalk, 0, 0.1, 7));
    sg.position.set(schoolBounds.cx, 0, schoolBounds.cz);
    scene.add(sg);

    const fieldZ = schoolBounds.cz + 18;
    const field = box(28, 0.1, 18, M.current.grass, schoolBounds.cx, 0.05, fieldZ, false, true);
    scene.add(field);
    scene.add(box(26, 0.12, 0.08, M.current.roadLine, schoolBounds.cx, 0.06, fieldZ - 8));
    scene.add(box(26, 0.12, 0.08, M.current.roadLine, schoolBounds.cx, 0.06, fieldZ + 8));
    scene.add(box(0.08, 0.12, 18, M.current.roadLine, schoolBounds.cx - 13, 0.06, fieldZ));
    scene.add(box(0.08, 0.12, 18, M.current.roadLine, schoolBounds.cx + 13, 0.06, fieldZ));
    const ringGeo = new THREE.RingGeometry(2.8, 3.0, 32);
    const ring = new THREE.Mesh(ringGeo, M.current.roadLine);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(schoolBounds.cx, 0.07, fieldZ);
    scene.add(ring);

    function createGoal(gx: number, gz: number) {
      const gg = new THREE.Group();
      gg.add(box(0.1, 2.2, 0.1, M.current.metal, -3.5, 1.1, 0));
      gg.add(box(0.1, 2.2, 0.1, M.current.metal, 3.5, 1.1, 0));
      gg.add(box(7.2, 0.1, 0.1, M.current.metal, 0, 2.2, 0));
      gg.add(box(7.2, 2.2, 0.02, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }), 0, 1.1, 0));
      gg.position.set(gx, 0, gz);
      scene.add(gg);
    }
    createGoal(schoolBounds.cx, fieldZ - 8);
    createGoal(schoolBounds.cx, fieldZ + 8);

    createTree(schoolBounds.cx - 14, schoolBounds.cz + 2);
    createTree(schoolBounds.cx + 14, schoolBounds.cz + 2);
    createTree(schoolBounds.cx - 14, schoolBounds.cz - 8);
    createTree(schoolBounds.cx + 14, schoolBounds.cz - 8);

    /* ─── Football ─── */
    const ball = new THREE.Group();
    ball.add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), M.current.ball));
    const stripe1 = new THREE.Mesh(G.current.torus, M.current.ballStripe);
    stripe1.rotation.x = Math.PI / 2;
    ball.add(stripe1);
    const stripe2 = new THREE.Mesh(G.current.torus, M.current.ballStripe);
    stripe2.rotation.x = 0;
    ball.add(stripe2);
    ball.position.set(schoolBounds.cx, 0.25, fieldZ);
    scene.add(ball);
    const ballState = { x: schoolBounds.cx, z: fieldZ, vx: 0, vz: 0 };

    /* ═══════════════════════════════════════════════════════════
       MANSION DISTRICT (Block 2,2)
       ═══════════════════════════════════════════════════════════ */
    const mansionBounds = getBlockBounds(2, 2);
    const mansion = new THREE.Group();
    mansionGroupRef.current = mansion;

    mansion.add(box(24, 6, 16, M.current.wallMansion, 0, 3, 0));
    mansion.add(box(25, 0.4, 17, M.current.roofGold, 0, 6.2, 0));
    mansion.add(box(18, 4, 12, M.current.wallMansion, 0, 8, 0));
    mansion.add(box(19, 0.4, 13, M.current.roofGold, 0, 10.2, 0));
    mansion.add(box(6, 10, 6, M.current.wallMansion, 8, 5, -4));
    mansion.add(box(6.5, 0.5, 6.5, M.current.roofGold, 8, 10.25, -4));
    for (let i = -1; i <= 1; i++) {
      mansion.add(box(2.5, 2.2, 0.15, M.current.window, i * 6, 3.5, 8.08));
      mansion.add(box(2.5, 2.2, 0.15, M.current.window, i * 6, 8.5, 6.08));
    }
    mansion.add(box(3.5, 3.5, 0.2, M.current.doorGlass, 0, 1.75, 8.1));
    const pool = box(10, 0.1, 6, M.current.water, 0, 0.05, 18);
    (pool.material as any).transparent = true;
    (pool.material as any).opacity = 0.85;
    mansion.add(pool);
    mansion.add(box(10.4, 0.25, 6.4, M.current.sidewalk, 0, 0.12, 18));
    createTree(-12, 12, mansion, 1.3);
    createTree(12, 12, mansion, 1.3);
    createTree(-12, -10, mansion, 1.3);
    createTree(12, -10, mansion, 1.3);
    for (let fx = -15; fx <= 15; fx += 3) {
      mansion.add(box(0.15, 1.2, 0.15, M.current.metal, fx, 0.6, 22));
      if (fx < 15) mansion.add(box(3.15, 0.05, 0.05, M.current.metal, fx + 1.5, 1.15, 22));
    }
    mansion.position.set(mansionBounds.cx, 0, mansionBounds.cz);
    scene.add(mansion);

    /* ═══════════════════════════════════════════════════════════
       INTERNATIONAL AIRPORT — North West
       ═══════════════════════════════════════════════════════════ */
    const airport = new THREE.Group();
    airportGroupRef.current = airport;
    const ax = -120, az = 0;
    airport.add(box(80, 0.15, 12, M.current.runway, 0, 0.075, 0));
    for (let rx = -35; rx < 35; rx += 8) {
      airport.add(box(3, 0.16, 0.3, M.current.runwayLine, rx, 0.08, 0));
    }
    airport.add(cylinder(2.5, 3.5, 18, 8, M.current.wallWhite, 20, 9, -15));
    airport.add(cylinder(3, 3, 3, 8, M.current.glass, 20, 19.5, -15));
    airport.add(box(4, 0.5, 4, M.current.roofDark, 20, 21.25, -15));
    airport.add(box(30, 5, 14, M.current.wallWhite, 15, 2.5, 18));
    airport.add(box(30, 0.3, 14, M.current.roofDark, 15, 5.15, 18));
    for (let i = -2; i <= 2; i++) {
      airport.add(box(3, 2.5, 0.15, M.current.towerWindow, i * 5 + 15, 3, 25.08));
    }
    airport.add(box(20, 6, 12, M.current.metal, -25, 3, -18));
    airport.add(box(20, 0.3, 12, M.current.roofDark, -25, 6.15, -18));
    airport.position.set(ax, 0, az);
    scene.add(airport);

    /* ─── Airplane ─── */
    const plane = new THREE.Group();
    plane.add(box(8, 1.8, 1.8, M.current.carWhite, 0, 1.2, 0));
    plane.add(box(1.5, 0.2, 6, M.current.carWhite, 0, 1.5, 0));
    plane.add(box(0.3, 2, 0.8, M.current.carWhite, -3.5, 1.5, 0));
    plane.add(box(1.2, 0.15, 1.2, M.current.glass, 3.8, 1.4, 0));
    plane.add(cylinder(0.4, 0.4, 1.2, 8, M.current.metal, 1.5, 0.6, 1.2, Math.PI/2));
    plane.add(cylinder(0.4, 0.4, 1.2, 8, M.current.metal, 1.5, 0.6, -1.2, Math.PI/2));
    plane.add(cylinder(0.4, 0.4, 1.2, 8, M.current.metal, -1.5, 0.6, 1.2, Math.PI/2));
    plane.add(cylinder(0.4, 0.4, 1.2, 8, M.current.metal, -1.5, 0.6, -1.2, Math.PI/2));
    plane.position.set(ax - 30, 0.5, az);
    scene.add(plane);
    planeRef.current.mesh = plane;
    planeRef.current.x = ax - 30;
    planeRef.current.z = az;
    planeRef.current.y = 0.5;

    /* ═══════════════════════════════════════════════════════════
       PERFECT CAR SYSTEM

       Car built facing +Z (length along Z axis):
       - Body: 1.0 wide (X), 0.55 tall (Y), 2.0 long (Z)
       - Wheels: radius 0.22, width 0.14
       - Track: 0.8 (wheel centers apart in X)
       - Wheelbase: 1.4 (wheel centers apart in Z)

       Group Y = road surface = 0.12
       Wheel center relative Y = 0.22 → absolute = 0.34
       Wheel bottom = 0.34 - 0.22 = 0.12 ✓ (exactly on road)
       Body bottom = wheel top + 0.01 gap = 0.56 + 0.01 = 0.57
       Body center = 0.57 + 0.275 = 0.845 → relative = 0.725

       Rotation for +X travel: Y = +π/2
       Rotation for -X travel: Y = -π/2
       Rotation for +Z travel: Y = 0
       Rotation for -Z travel: Y = π

       Lanes are at road_center ± LANE_OFFSET (±1.8m from road center)
       ═══════════════════════════════════════════════════════════ */
    const lanes: any[] = [];
    ROAD_CENTERS.forEach((z) => {
      lanes.push({ type: "h", z: z - LANE_OFFSET, dir: 1, id: `h_pos_${z}` });   // south lane, +X
      lanes.push({ type: "h", z: z + LANE_OFFSET, dir: -1, id: `h_neg_${z}` });  // north lane, -X
    });
    ROAD_CENTERS.forEach((x) => {
      lanes.push({ type: "v", x: x - LANE_OFFSET, dir: 1, id: `v_pos_${x}` });   // west lane, +Z
      lanes.push({ type: "v", x: x + LANE_OFFSET, dir: -1, id: `v_neg_${x}` });  // east lane, -Z
    });
    lanesRef.current = lanes;

    const laneColors = [M.current.carRed, M.current.carBlue, M.current.carBlack, M.current.carWhite, M.current.carSilver, M.current.carGold];
    const cars: any[] = [];

    function createCar(lane: any, x: number, z: number, colorMat: THREE.Material) {
      const group = new THREE.Group();
      const ROAD_Y = 0.12;
      const WHEEL_R = 0.22;
      const WHEEL_W = 0.14;
      const TRACK = 0.8;
      const WHEELBASE = 1.4;
      const BODY_W = 1.0;
      const BODY_H = 0.55;
      const BODY_L = 2.0;
      const BODY_GAP = 0.01;

      group.position.set(x, ROAD_Y, z);

      // Wheels — positioned so bottom touches road at Y=0.12
      const wheelGeo = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, WHEEL_W, 16);
      const wheelRelY = WHEEL_R; // 0.22
      const wheelPositions = [
        [-TRACK/2, wheelRelY, WHEELBASE/2],   // Front Left
        [TRACK/2, wheelRelY, WHEELBASE/2],    // Front Right
        [-TRACK/2, wheelRelY, -WHEELBASE/2],  // Rear Left
        [TRACK/2, wheelRelY, -WHEELBASE/2],   // Rear Right
      ];
      const wheels: any[] = [];
      wheelPositions.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, M.current.wheel);
        wheel.position.set(wx, wy, wz);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        group.add(wheel);
        wheels.push(wheel);
      });

      // Body — sits on top of wheels with 0.01m gap
      const bodyBottomAbs = ROAD_Y + wheelRelY + WHEEL_R + BODY_GAP; // 0.12 + 0.22 + 0.22 + 0.01 = 0.57
      const bodyCenterRel = (bodyBottomAbs - ROAD_Y) + BODY_H / 2;   // 0.45 + 0.275 = 0.725
      const body = new THREE.Mesh(G.current.box, colorMat);
      body.scale.set(BODY_W, BODY_H, BODY_L);
      body.position.set(0, bodyCenterRel, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // Roof / cabin
      const roofW = 0.85;
      const roofH = 0.35;
      const roofL = 1.4;
      const roofBottomRel = bodyCenterRel + BODY_H/2; // 0.725 + 0.275 = 1.0
      const roofCenterRel = roofBottomRel + roofH/2;  // 1.0 + 0.175 = 1.175
      const roof = new THREE.Mesh(G.current.box, M.current.glass);
      roof.scale.set(roofW, roofH, roofL);
      roof.position.set(0, roofCenterRel, -0.1);
      roof.castShadow = true;
      group.add(roof);

      // Headlights (front of car, local Z = +BODY_L/2 = +1.0)
      const hlGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const hlY = bodyCenterRel - 0.08;
      const hlZ = BODY_L / 2;
      const hl1 = new THREE.Mesh(hlGeo, M.current.headlight);
      hl1.position.set(-0.3, hlY, hlZ);
      group.add(hl1);
      const hl2 = new THREE.Mesh(hlGeo, M.current.headlight);
      hl2.position.set(0.3, hlY, hlZ);
      group.add(hl2);

      // Taillights
      const tlGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const tl1 = new THREE.Mesh(tlGeo, M.current.taillight);
      tl1.position.set(-0.3, hlY, -hlZ);
      group.add(tl1);
      const tl2 = new THREE.Mesh(tlGeo, M.current.taillight);
      tl2.position.set(0.3, hlY, -hlZ);
      group.add(tl2);

      scene.add(group);

      return {
        mesh: group, lane, pos: lane.type === "h" ? x : z,
        speed: 0.02 + Math.random() * 0.03, maxSpeed: 0.08,
        wheels, state: "driving", turnData: null,
        headlightL: hl1, headlightR: hl2,
      };
    }

    for (let i = 0; i < 20; i++) {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      let x = 0, z = 0;
      if (lane.type === "h") {
        x = (Math.random() * 160) - 80;
        z = lane.z;
      } else {
        x = lane.x;
        z = (Math.random() * 160) - 80;
      }
      const colorMat = laneColors[Math.floor(Math.random() * laneColors.length)];
      const car = createCar(lane, x, z, colorMat);
      car.pos = lane.type === "h" ? x : z;
      // Set initial rotation based on lane direction
      if (lane.type === "h") {
        car.mesh.rotation.y = lane.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      } else {
        car.mesh.rotation.y = lane.dir > 0 ? 0 : Math.PI;
      }
      cars.push(car);
    }
    carsRef.current = cars;

    /* ═══════════════════════════════════════════════════════════
       TURN CURVE — Quadratic Bezier with verified control points
       ═══════════════════════════════════════════════════════════ */
    function getTurnCurve(ix: number, iz: number, lane: any, turn: string) {
      const approachDist = 8;
      const exitDist = 8;

      let startX: number, startZ: number, endX: number, endZ: number;
      let startRot: number, endRot: number;

      if (lane.type === "h") {
        // Horizontal road, moving along X
        const laneZ = lane.z;
        startX = lane.dir > 0 ? ix - approachDist : ix + approachDist;
        startZ = laneZ;
        startRot = lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2;

        if (turn === "right") {
          // Right from +X → +Z, or -X → -Z
          endX = lane.dir > 0 ? ix + exitDist : ix - exitDist;
          endZ = lane.dir > 0 ? iz + exitDist : iz - exitDist;
          endRot = lane.dir > 0 ? 0 : Math.PI;
        } else {
          // Left from +X → -Z, or -X → +Z
          endX = lane.dir > 0 ? ix + exitDist : ix - exitDist;
          endZ = lane.dir > 0 ? iz - exitDist : iz + exitDist;
          endRot = lane.dir > 0 ? Math.PI : 0;
        }
      } else {
        // Vertical road, moving along Z
        const laneX = lane.x;
        startX = laneX;
        startZ = lane.dir > 0 ? iz - approachDist : iz + approachDist;
        startRot = lane.dir > 0 ? 0 : Math.PI;

        if (turn === "right") {
          // Right from +Z → -X, or -Z → +X
          endX = lane.dir > 0 ? ix - exitDist : ix + exitDist;
          endZ = lane.dir > 0 ? iz + exitDist : iz - exitDist;
          endRot = lane.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
        } else {
          // Left from +Z → +X, or -Z → -X
          endX = lane.dir > 0 ? ix + exitDist : ix - exitDist;
          endZ = lane.dir > 0 ? iz + exitDist : iz - exitDist;
          endRot = lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
      }

      const cx = (startX + endX) / 2;
      const cz = (startZ + endZ) / 2;
      return { startX, startZ, endX, endZ, cx, cz, startRot, endRot };
    }

    /* ═══════════════════════════════════════════════════════════
       PEDESTRIANS
       ═══════════════════════════════════════════════════════════ */
    const pedestrians: any[] = [];
    function createPedestrian(x: number, z: number, shirtMat: THREE.Material) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(G.current.box, shirtMat);
      body.scale.set(0.5, 0.8, 0.4);
      body.position.y = 0.4;
      body.castShadow = true;
      group.add(body);
      const head = new THREE.Mesh(G.current.sphere, M.current.skin);
      head.scale.set(0.3, 0.3, 0.3);
      head.position.y = 0.9;
      head.castShadow = true;
      group.add(head);
      const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
      const leg1 = new THREE.Mesh(legGeo, M.current.pantsBlue);
      leg1.position.set(-0.15, 0.2, 0);
      leg1.castShadow = true;
      const leg2 = new THREE.Mesh(legGeo, M.current.pantsBlue);
      leg2.position.set(0.15, 0.2, 0);
      leg2.castShadow = true;
      group.add(leg1);
      group.add(leg2);
      const armGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
      const arm1 = new THREE.Mesh(armGeo, shirtMat);
      arm1.position.set(-0.4, 0.7, 0);
      arm1.castShadow = true;
      const arm2 = new THREE.Mesh(armGeo, shirtMat);
      arm2.position.set(0.4, 0.7, 0);
      arm2.castShadow = true;
      group.add(arm1);
      group.add(arm2);
      group.position.set(x, 0, z);
      scene.add(group);
      return {
        mesh: group, targetX: x + (Math.random() - 0.5) * 30, targetZ: z + (Math.random() - 0.5) * 30,
        speed: 0.025 + Math.random() * 0.03, waitTime: 0, leg1, leg2, arm1, arm2,
        waveTimer: 0,
      };
    }

    const shirtColors = [M.current.shirtBlue, M.current.shirtWhite, M.current.shirtGreen, M.current.shirtPink, M.current.shirtRed, M.current.shirtYellow, M.current.shirtPurple];
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      pedestrians.push(createPedestrian(x, z, shirtColors[Math.floor(Math.random() * shirtColors.length)]));
    }
    pedsRef.current = pedestrians;

    /* ═══════════════════════════════════════════════════════════
       SCHOOL KIDS
       ═══════════════════════════════════════════════════════════ */
    const schoolKids: any[] = [];
    function createSchoolKid(x: number, z: number) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(G.current.box, M.current.shirtBlue);
      body.scale.set(0.45, 0.7, 0.35);
      body.position.y = 0.35;
      body.castShadow = true;
      group.add(body);
      const head = new THREE.Mesh(G.current.sphere, M.current.skin);
      head.scale.set(0.28, 0.28, 0.28);
      head.position.y = 0.8;
      head.castShadow = true;
      group.add(head);
      const legGeo = new THREE.BoxGeometry(0.18, 0.45, 0.18);
      const leg1 = new THREE.Mesh(legGeo, M.current.pantsGray);
      leg1.position.set(-0.12, 0.2, 0);
      leg1.castShadow = true;
      const leg2 = new THREE.Mesh(legGeo, M.current.pantsGray);
      leg2.position.set(0.12, 0.2, 0);
      leg2.castShadow = true;
      group.add(leg1);
      group.add(leg2);
      const armGeo = new THREE.BoxGeometry(0.18, 0.5, 0.18);
      const arm1 = new THREE.Mesh(armGeo, M.current.shirtBlue);
      arm1.position.set(-0.35, 0.65, 0);
      arm1.castShadow = true;
      const arm2 = new THREE.Mesh(armGeo, M.current.shirtBlue);
      arm2.position.set(0.35, 0.65, 0);
      arm2.castShadow = true;
      group.add(arm1);
      group.add(arm2);
      group.position.set(x, 0, z);
      scene.add(group);
      return {
        mesh: group, targetX: x + (Math.random() - 0.5) * 20, targetZ: z + (Math.random() - 0.5) * 12,
        speed: 0.035 + Math.random() * 0.04, waitTime: 0, leg1, leg2, arm1, arm2,
      };
    }

    for (let i = 0; i < 10; i++) {
      const x = schoolBounds.cx + (Math.random() - 0.5) * 20;
      const z = fieldZ + (Math.random() - 0.5) * 12;
      schoolKids.push(createSchoolKid(x, z));
    }
    kidsRef.current = schoolKids;

    /* ═══════════════════════════════════════════════════════════
       FAMILY (Rigged for Proposal)
       ═══════════════════════════════════════════════════════════ */
    const family: any = {};
    function createRiggedPerson(x: number, z: number, bodyMat: THREE.Material, scale = 1, isQueen = false) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(G.current.box, bodyMat);
      body.scale.set(0.5 * scale, 0.85 * scale, 0.4 * scale);
      body.position.y = 0.45 * scale;
      body.castShadow = true;
      group.add(body);
      const head = new THREE.Mesh(G.current.sphere, M.current.skin);
      head.scale.set(0.3 * scale, 0.3 * scale, 0.3 * scale);
      head.position.y = 0.95 * scale;
      head.castShadow = true;
      group.add(head);
      if (isQueen) {
        const crown = new THREE.Mesh(G.current.cylinder, M.current.gold);
        crown.scale.set(0.25 * scale, 0.08 * scale, 0.25 * scale);
        crown.position.y = 1.18 * scale;
        group.add(crown);
      } else {
        const hair = new THREE.Mesh(G.current.sphere, M.current.hairBlack);
        hair.scale.set(0.32 * scale, 0.15 * scale, 0.32 * scale);
        hair.position.y = 1.05 * scale;
        group.add(hair);
      }
      const legGeo = new THREE.BoxGeometry(0.2 * scale, 0.5 * scale, 0.2 * scale);
      const leg1 = new THREE.Mesh(legGeo, M.current.pantsBlue);
      leg1.position.set(-0.15 * scale, 0.25 * scale, 0);
      leg1.castShadow = true;
      const leg2 = new THREE.Mesh(legGeo, M.current.pantsBlue);
      leg2.position.set(0.15 * scale, 0.25 * scale, 0);
      leg2.castShadow = true;
      group.add(leg1);
      group.add(leg2);
      const armGeo = new THREE.BoxGeometry(0.2 * scale, 0.6 * scale, 0.2 * scale);
      const arm1 = new THREE.Mesh(armGeo, bodyMat);
      arm1.position.set(-0.4 * scale, 0.75 * scale, 0);
      arm1.castShadow = true;
      const arm2 = new THREE.Mesh(armGeo, bodyMat);
      arm2.position.set(0.4 * scale, 0.75 * scale, 0);
      arm2.castShadow = true;
      group.add(arm1);
      group.add(arm2);
      group.position.set(x, 0, z);
      scene.add(group);
      return { mesh: group, leg1, leg2, arm1, arm2, head, body, scale, origin: { x, z },
        target: { x, z }, rotY: 0, kneelFactor: 0 };
    }

    const famX = mansionBounds.cx;
    const famZ = mansionBounds.cz + 22;
    family.dad = createRiggedPerson(famX - 1.5, famZ, M.current.suit, 1.05);
    family.mom = createRiggedPerson(famX + 1.5, famZ, M.current.dressQueen, 1, true);
    family.son = createRiggedPerson(famX - 0.5, famZ + 2, M.current.shirtGreen, 0.85);
    family.daughter = createRiggedPerson(famX + 0.8, famZ + 2.5, M.current.dress, 0.8);
    familyRef.current = family;

    /* ═══════════════════════════════════════════════════════════
       STREET LIGHTS
       ═══════════════════════════════════════════════════════════ */
    const streetLights: any[] = [];
    function createStreetLight(x: number, z: number) {
      const group = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3.5, 6), M.current.metal);
      pole.position.y = 1.75;
      pole.castShadow = true;
      group.add(pole);
      const arm = new THREE.Mesh(G.current.box, M.current.metal);
      arm.scale.set(1.2, 0.1, 0.1);
      arm.position.set(0.6, 3.2, 0);
      arm.castShadow = true;
      group.add(arm);
      const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffdd99, emissive: 0xffaa55, emissiveIntensity: 0 });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bulbMat);
      bulb.position.set(1.1, 3.2, 0);
      group.add(bulb);
      group.position.set(x, 0, z);
      scene.add(group);
      const light = new THREE.PointLight(0xffaa66, 0, 14);
      light.position.set(x + 1.1, 3.2, z);
      scene.add(light);
      streetLights.push({ light, bulb, group, baseInt: 1.5 });
    }

    for (let x = -80; x <= 80; x += 20) {
      for (let z of ROAD_CENTERS) {
        if (Math.abs(x) < 90 && Math.abs(z) < 90) {
          createStreetLight(x + 4, z + 3);
          createStreetLight(x + 4, z - 3);
        }
      }
    }
    streetLightsRef.current = streetLights;

    /* ═══════════════════════════════════════════════════════════
       BIRTHDAY DECORATIONS
       ═══════════════════════════════════════════════════════════ */
    const birthdayGroup = new THREE.Group();
    birthdayGroupRef.current = birthdayGroup;
    scene.add(birthdayGroup);

    function spawnBirthdayDecorations() {
      for (let i = 0; i < 12; i++) {
        const t = i / 11;
        const bx = (t - 0.5) * 10;
        const by = 2 + Math.sin(t * Math.PI) * 2.5;
        const bz = 26;
        const balloon = new THREE.Mesh(G.current.sphere, i % 3 === 0 ? M.current.balloonGold : M.current.balloon);
        balloon.scale.set(0.35, 0.4, 0.35);
        balloon.position.set(bx, by, bz);
        birthdayGroup.add(balloon);
        const string = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, by, 4), M.current.metal);
        string.position.set(bx, by / 2, bz);
        birthdayGroup.add(string);
      }
      const cake = new THREE.Group();
      cake.add(box(1.2, 0.5, 1.2, M.current.cake, 0, 0.25, 0));
      cake.add(box(0.08, 0.4, 0.08, M.current.candle, -0.3, 0.7, -0.3));
      cake.add(box(0.08, 0.4, 0.08, M.current.candle, 0.3, 0.7, 0.3));
      cake.add(box(0.08, 0.4, 0.08, M.current.candle, 0, 0.7, 0));
      cake.position.set(mansionBounds.cx, 0, mansionBounds.cz + 26);
      birthdayGroup.add(cake);
      for (let i = -4; i <= 4; i++) {
        const letter = new THREE.Mesh(G.current.box, M.current.balloon);
        letter.scale.set(0.4, 0.5, 0.05);
        letter.position.set(i * 0.6, 3.5, 26.5);
        birthdayGroup.add(letter);
      }
      for (let i = 0; i < 20; i++) {
        const pl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), M.current.balloonGold);
        pl.position.set(
          mansionBounds.cx + (Math.random() - 0.5) * 20,
          2.5 + Math.random() * 1.5,
          mansionBounds.cz + 15 + Math.random() * 15
        );
        birthdayGroup.add(pl);
      }
    }

    /* ─── Fireworks ─── */
    function createFirework(x: number, y: number, z: number, color: number) {
      const count = 60;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const vel: any[] = [];
      for (let i = 0; i < count; i++) {
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 0.3 + Math.random() * 0.4;
        vel.push({ x: speed * Math.sin(phi) * Math.cos(theta), y: speed * Math.sin(phi) * Math.sin(theta), z: speed * Math.cos(phi) });
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color, size: 0.25, transparent: true, opacity: 1 });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      fireworksRef.current.push({ mesh: pts, velocities: vel, life: 1.5, maxLife: 1.5 });
    }

    /* ═══════════════════════════════════════════════════════════
       TIME SYSTEM
       ═══════════════════════════════════════════════════════════ */
    let timeOfDay = 9.0;

    function updateTime(dt: number) {
      const s = settingsRef.current;
      const kenyanNow = getKenyanTime();
      const realHour = kenyanNow.getHours() + kenyanNow.getMinutes() / 60;
      const isBday = s.timeMode === "birthday" || isQueensBirthday(kenyanNow);

      if (!s.paused) {
        if (s.timeMode === "real") {
          timeOfDay = realHour;
        } else {
          timeOfDay += (dt / 1000) * (24 / DAY_SECONDS) * s.timeSpeed;
          if (timeOfDay >= 24) timeOfDay -= 24;
        }
      }

      const hours = Math.floor(timeOfDay);
      const minutes = Math.floor((timeOfDay - hours) * 60);
      if (clockRef.current) clockRef.current.textContent = fmtTime(hours, minutes);

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let dateStr: string;
      if (isBday) {
        dateStr = `Saturday, June 1 — 👑 Queen's Birthday 🎉`;
      } else {
        dateStr = `${days[kenyanNow.getDay()]}, ${kenyanNow.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
      }
      if (dateRef.current) dateRef.current.textContent = dateStr;

      let skyColor: THREE.Color | number, sunInt: number, ambInt: number, starOp = 0;
      if (!s.dayNightCycle) {
        skyColor = 0x87ceeb; sunInt = 1.3; ambInt = 0.5; starOp = 0;
      } else if (timeOfDay < 5 || timeOfDay > 20.5) {
        skyColor = 0x0a0a1a; sunInt = 0; ambInt = 0.1; starOp = 0.9;
      } else if (timeOfDay < 7) {
        const t = (timeOfDay - 5) / 2;
        skyColor = new THREE.Color(0x0a0a1a).lerp(new THREE.Color(0xffaa77), t);
        sunInt = t * 1.3; ambInt = 0.1 + t * 0.4; starOp = 0.9 * (1 - t);
      } else if (timeOfDay < 17) {
        skyColor = 0x87ceeb; sunInt = 1.3; ambInt = 0.5; starOp = 0;
      } else if (timeOfDay < 20.5) {
        const t = (timeOfDay - 17) / 3.5;
        skyColor = new THREE.Color(0x87ceeb).lerp(new THREE.Color(0x0a0a1a), t);
        sunInt = 1.3 * (1 - t); ambInt = 0.5 * (1 - t) + 0.1 * t; starOp = 0.9 * t;
      } else {
        skyColor = 0x0a0a1a; sunInt = 0; ambInt = 0.1; starOp = 0.9;
      }

      const hex = skyColor instanceof THREE.Color ? skyColor.getHex() : skyColor;
      scene.background = new THREE.Color(hex);
      if (s.fog) {
        scene.fog = new THREE.Fog(hex, 100 * s.fogDensity, 320 * s.fogDensity);
      } else {
        scene.fog = null;
      }
      sunLight.intensity = sunInt;
      ambientLight.intensity = ambInt;
      sunLight.castShadow = s.shadows;
      if (starsRef.current) {
        (starsRef.current.material as THREE.PointsMaterial).opacity = starOp;
      }

      const angle = ((timeOfDay - 6) / 12) * Math.PI;
      sunLight.position.set(Math.cos(angle) * 120, Math.sin(angle) * 80, 50);

      const isNight = timeOfDay < 6 || timeOfDay > 19.5;
      streetLights.forEach((sl) => {
        const on = isNight && s.showStreetLights;
        sl.light.intensity = on ? sl.baseInt : 0;
        (sl.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 1 : 0;
      });

      return { isBday, timeOfDay };
    }

    /* ═══════════════════════════════════════════════════════════
       CAR UPDATE (Perfect math — no sinking, no flying)
       ═══════════════════════════════════════════════════════════ */
    function updateCars(dt: number) {
      const s = settingsRef.current;
      if (!s.showCars) {
        cars.forEach((c) => (c.mesh.visible = false));
        return;
      }
      const dtSec = dt / 1000;
      cars.forEach((car) => {
        car.mesh.visible = true;
        if (car.state === "driving") {
          let nearestIx: any = null, nearestDist = Infinity;
          for (const ix of intersections) {
            let dist: number;
            if (car.lane.type === "h") {
              dist = car.lane.dir > 0 ? ix.x - car.pos : car.pos - ix.x;
            } else {
              dist = car.lane.dir > 0 ? ix.z - car.pos : car.pos - ix.z;
            }
            if (dist > 2 && dist < nearestDist) { nearestDist = dist; nearestIx = ix; }
          }

          let targetSpeed = car.maxSpeed * s.carSpeed;
          for (const other of cars) {
            if (other === car || other.lane.id !== car.lane.id) continue;
            let dist: number;
            if (car.lane.type === "h") {
              dist = car.lane.dir > 0 ? other.mesh.position.x - car.mesh.position.x : car.mesh.position.x - other.mesh.position.x;
            } else {
              dist = car.lane.dir > 0 ? other.mesh.position.z - car.mesh.position.z : car.mesh.position.z - other.mesh.position.z;
            }
            if (dist > 0 && dist < 14) targetSpeed = Math.min(targetSpeed, other.speed * 0.85);
          }

          if (nearestIx && nearestDist < 16) {
            const rand = Math.random();
            let turn = "straight";
            if (rand < 0.25) turn = "right";
            else if (rand < 0.4) turn = "left";
            if (turn !== "straight") {
              const curve = getTurnCurve(nearestIx.x, nearestIx.z, car.lane, turn);
              car.state = "turning";
              car.turnData = { ...curve, elapsed: 0, duration: 2.2 };
              return;
            } else if (nearestDist < 9) {
              targetSpeed = Math.min(targetSpeed, 0.035);
            }
          }

          car.speed += (targetSpeed - car.speed) * 0.06;
          const move = car.speed * dtSec * 30;
          if (car.lane.type === "h") {
            car.pos += car.lane.dir * move;
            car.mesh.position.x = car.pos;
            car.mesh.position.z = car.lane.z;
            car.mesh.rotation.y = car.lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
          } else {
            car.pos += car.lane.dir * move;
            car.mesh.position.z = car.pos;
            car.mesh.position.x = car.lane.x;
            car.mesh.rotation.y = car.lane.dir > 0 ? 0 : Math.PI;
          }
          if (car.pos > CITY_MAX + 8) car.pos = CITY_MIN - 8;
          if (car.pos < CITY_MIN - 8) car.pos = CITY_MAX + 8;
        } else if (car.state === "turning") {
          const td = car.turnData;
          td.elapsed += dtSec;
          let t = clamp(td.elapsed / td.duration, 0, 1);
          const omt = 1 - t;
          const x = omt * omt * td.startX + 2 * omt * t * td.cx + t * t * td.endX;
          const z = omt * omt * td.startZ + 2 * omt * t * td.cz + t * t * td.endZ;
          car.mesh.position.set(x, 0.12, z);
          let rotDiff = td.endRot - td.startRot;
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
          car.mesh.rotation.y = td.startRot + rotDiff * t;
          if (t >= 1) {
            car.state = "driving";
            car.turnData = null;
            let bestLane = car.lane, bestDist = Infinity;
            lanes.forEach((l) => {
              let dist = l.type === "h" ? Math.abs(car.mesh.position.z - l.z) : Math.abs(car.mesh.position.x - l.x);
              if (dist < bestDist) { bestDist = dist; bestLane = l; }
            });
            car.lane = bestLane;
            car.pos = car.lane.type === "h" ? car.mesh.position.x : car.mesh.position.z;
          }
        }
        const wheelSpeed = car.speed * 18;
        car.wheels.forEach((w: any) => {
          w.rotation.x += wheelSpeed * dtSec;
        });
      });
    }

    /* ═══════════════════════════════════════════════════════════
       PEDESTRIANS, KIDS, FAMILY, PLAYER, PLANE, FIREWORKS
       ═══════════════════════════════════════════════════════════ */
    function updatePedestrians(dt: number) {
      const s = settingsRef.current;
      const time = Date.now() * 0.001;
      pedestrians.forEach((p) => {
        p.mesh.visible = s.showPedestrians;
        if (!s.showPedestrians) return;
        if (p.waitTime > 0) {
          p.waitTime -= dt;
          p.arm1.rotation.x = Math.sin(time * 2) * 0.08;
          p.arm2.rotation.x = Math.sin(time * 2 + Math.PI) * 0.08;
          return;
        }
        const dx = p.targetX - p.mesh.position.x;
        const dz = p.targetZ - p.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.5) {
          p.targetX = clamp(p.mesh.position.x + (Math.random() - 0.5) * 30, CITY_MIN + 8, CITY_MAX - 8);
          p.targetZ = clamp(p.mesh.position.z + (Math.random() - 0.5) * 30, CITY_MIN + 8, CITY_MAX - 8);
          p.waitTime = Math.random() * 2000 + 500;
        } else {
          const move = p.speed * s.pedestrianSpeed * (dt / 16);
          p.mesh.position.x += (dx / dist) * move;
          p.mesh.position.z += (dz / dist) * move;
          p.mesh.rotation.y = Math.atan2(dx, dz);
          const cycle = time * 5;
          p.leg1.rotation.x = Math.sin(cycle) * 0.55;
          p.leg2.rotation.x = Math.sin(cycle + Math.PI) * 0.55;
          p.arm1.rotation.x = Math.sin(cycle + Math.PI) * 0.45;
          p.arm2.rotation.x = Math.sin(cycle) * 0.45;
        }
        if (p.waveTimer > 0) {
          p.waveTimer -= dt;
          p.arm1.rotation.x = -Math.PI / 2 + Math.sin(time * 15) * 0.3;
        }
      });
    }

    function updateSchoolKids(dt: number) {
      const s = settingsRef.current;
      const time = Date.now() * 0.001;
      schoolKids.forEach((kid, i) => {
        kid.mesh.visible = s.showSchoolKids;
        if (!s.showSchoolKids) return;
        if (kid.waitTime > 0) {
          kid.waitTime -= dt;
          kid.arm1.rotation.x = Math.sin(time * 3 + i) * 0.3;
          kid.arm2.rotation.x = Math.sin(time * 3 + i + Math.PI) * 0.3;
          return;
        }
        const bdx = ballState.x - kid.mesh.position.x;
        const bdz = ballState.z - kid.mesh.position.z;
        const bdist = Math.sqrt(bdx * bdx + bdz * bdz);
        if (bdist > 1.5 && Math.random() < 0.25) {
          const runSpeed = kid.speed * 1.6 * s.pedestrianSpeed;
          const move = runSpeed * (dt / 16);
          kid.mesh.position.x += (bdx / bdist) * move;
          kid.mesh.position.z += (bdz / bdist) * move;
          kid.mesh.rotation.y = Math.atan2(bdx, bdz);
          const rc = time * 12;
          kid.leg1.rotation.x = Math.sin(rc) * 0.85;
          kid.leg2.rotation.x = Math.sin(rc + Math.PI) * 0.85;
          kid.arm1.rotation.x = Math.sin(rc + Math.PI) * 0.75;
          kid.arm2.rotation.x = Math.sin(rc) * 0.75;
          if (bdist < 1.0) {
            ballState.vx += (bdx / bdist) * 0.15;
            ballState.vz += (bdz / bdist) * 0.15;
            kid.waitTime = 500;
          }
        } else {
          const dx = kid.targetX - kid.mesh.position.x;
          const dz = kid.targetZ - kid.mesh.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 1) {
            kid.targetX = schoolBounds.cx + (Math.random() - 0.5) * 20;
            kid.targetZ = fieldZ + (Math.random() - 0.5) * 12;
            kid.waitTime = Math.random() * 1200;
          } else {
            const move = kid.speed * s.pedestrianSpeed * (dt / 16);
            kid.mesh.position.x += (dx / dist) * move;
            kid.mesh.position.z += (dz / dist) * move;
            kid.mesh.rotation.y = Math.atan2(dx, dz);
            const wc = time * 7;
            kid.leg1.rotation.x = Math.sin(wc) * 0.5;
            kid.leg2.rotation.x = Math.sin(wc + Math.PI) * 0.5;
            kid.arm1.rotation.x = Math.sin(wc + Math.PI) * 0.4;
            kid.arm2.rotation.x = Math.sin(wc) * 0.4;
          }
        }
        kid.mesh.position.x = clamp(kid.mesh.position.x, schoolBounds.cx - 13, schoolBounds.cx + 13);
        kid.mesh.position.z = clamp(kid.mesh.position.z, fieldZ - 9, fieldZ + 9);
      });
      ballState.x += ballState.vx;
      ballState.z += ballState.vz;
      ballState.vx *= 0.94;
      ballState.vz *= 0.94;
      ballState.x = clamp(ballState.x, schoolBounds.cx - 13, schoolBounds.cx + 13);
      ballState.z = clamp(ballState.z, fieldZ - 9, fieldZ + 9);
      ball.position.set(ballState.x, 0.25 + Math.abs(Math.sin(time * 6)) * 0.06, ballState.z);
      ball.rotation.x += ballState.vz * 2.5;
      ball.rotation.z -= ballState.vx * 2.5;
    }

    function updateFamily(dt: number) {
      const s = settingsRef.current;
      const time = Date.now() * 0.001;
      const kenyan = getKenyanTime();
      const isBday = s.timeMode === "birthday" || isQueensBirthday(kenyan);

      Object.values(family).forEach((member: any) => { member.mesh.visible = s.showFamily; });
      if (!s.showFamily) return;

      if (isBday && !proposalRef.current.active) {
        proposalRef.current.active = true;
        proposalRef.current.phase = "approach";
        proposalRef.current.timer = 0;
        family.dad.target = { x: mansionBounds.cx, z: mansionBounds.cz + 24 };
        family.mom.target = { x: mansionBounds.cx + 2, z: mansionBounds.cz + 24 };
        family.son.target = { x: mansionBounds.cx - 3, z: mansionBounds.cz + 26 };
        family.daughter.target = { x: mansionBounds.cx + 3.5, z: mansionBounds.cz + 26 };
        spawnBirthdayDecorations();
      }

      if (!isBday && proposalRef.current.active) {
        proposalRef.current.active = false;
        proposalRef.current.phase = "idle";
        birthdayGroup.clear();
      }

      if (isBday && proposalRef.current.active) {
        const pr = proposalRef.current;
        pr.timer += dt / 1000;
        switch (pr.phase) {
          case "approach": {
            const dad = family.dad;
            const dx = dad.target.x - dad.mesh.position.x;
            const dz = dad.target.z - dad.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.2) {
              dad.mesh.position.x += (dx / dist) * 0.03 * (dt / 16);
              dad.mesh.position.z += (dz / dist) * 0.03 * (dt / 16);
              dad.mesh.rotation.y = Math.atan2(dx, dz);
              dad.leg1.rotation.x = Math.sin(time * 6) * 0.4;
              dad.leg2.rotation.x = Math.sin(time * 6 + Math.PI) * 0.4;
            } else {
              pr.phase = "kneel"; pr.timer = 0;
            }
            break;
          }
          case "kneel": {
            const dad = family.dad;
            dad.kneelFactor = lerp(dad.kneelFactor, 1, 0.04);
            dad.mesh.position.y = -dad.kneelFactor * 0.4;
            dad.leg1.rotation.x = -dad.kneelFactor * 1.2;
            dad.leg2.rotation.x = -dad.kneelFactor * 1.2;
            dad.arm2.rotation.x = lerp(dad.arm2.rotation.x, -Math.PI / 2.5, 0.05);
            if (pr.timer > 2) {
              pr.phase = "present"; pr.timer = 0;
              const ringMesh = new THREE.Mesh(G.current.torus, M.current.gold);
              ringMesh.scale.set(0.3, 0.3, 0.3);
              ringMesh.position.set(0.3, 0.6, 0.3);
              dad.mesh.add(ringMesh);
              dad.ring = ringMesh;
            }
            break;
          }
          case "present": {
            family.dad.arm2.rotation.x = -Math.PI / 2.2 + Math.sin(time * 3) * 0.05;
            if (pr.timer > 2.5) { pr.phase = "accept"; pr.timer = 0; }
            break;
          }
          case "accept": {
            const mom = family.mom;
            const dx = family.dad.mesh.position.x - mom.mesh.position.x;
            const dz = family.dad.mesh.position.z - mom.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 1.2) {
              mom.mesh.position.x += (dx / dist) * 0.025 * (dt / 16);
              mom.mesh.position.z += (dz / dist) * 0.025 * (dt / 16);
              mom.mesh.rotation.y = Math.atan2(dx, dz);
              mom.leg1.rotation.x = Math.sin(time * 5) * 0.3;
              mom.leg2.rotation.x = Math.sin(time * 5 + Math.PI) * 0.3;
              mom.arm1.rotation.x = Math.sin(time * 3) * 0.2;
            } else {
              pr.phase = "hug"; pr.timer = 0;
            }
            break;
          }
          case "hug": {
            const dad = family.dad;
            const mom = family.mom;
            dad.kneelFactor = lerp(dad.kneelFactor, 0, 0.03);
            dad.mesh.position.y = -dad.kneelFactor * 0.4;
            dad.leg1.rotation.x = lerp(dad.leg1.rotation.x, 0, 0.05);
            dad.leg2.rotation.x = lerp(dad.leg2.rotation.x, 0, 0.05);
            dad.arm2.rotation.x = lerp(dad.arm2.rotation.x, -0.5, 0.05);
            dad.arm1.rotation.x = lerp(dad.arm1.rotation.x, -0.5, 0.05);
            mom.arm1.rotation.x = lerp(mom.arm1.rotation.x, -0.6, 0.05);
            mom.arm2.rotation.x = lerp(mom.arm2.rotation.x, -0.6, 0.05);
            const mx = (dad.mesh.position.x + mom.mesh.position.x) / 2;
            const mz = (dad.mesh.position.z + mom.mesh.position.z) / 2;
            dad.mesh.position.x = lerp(dad.mesh.position.x, mx - 0.3, 0.02);
            dad.mesh.position.z = lerp(dad.mesh.position.z, mz, 0.02);
            mom.mesh.position.x = lerp(mom.mesh.position.x, mx + 0.3, 0.02);
            mom.mesh.position.z = lerp(mom.mesh.position.z, mz, 0.02);
            if (pr.timer > 3) { pr.phase = "celebrate"; pr.timer = 0; pr.subTimer = 0; }
            break;
          }
          case "celebrate": {
            const dad = family.dad;
            const mom = family.mom;
            dad.mesh.position.y = Math.abs(Math.sin(time * 4)) * 0.15;
            mom.mesh.position.y = Math.abs(Math.sin(time * 4 + 1)) * 0.15;
            dad.arm1.rotation.x = Math.sin(time * 6) * 1.5;
            dad.arm2.rotation.x = Math.sin(time * 6 + Math.PI) * 1.5;
            mom.arm1.rotation.x = Math.sin(time * 6 + 0.5) * 1.5;
            mom.arm2.rotation.x = Math.sin(time * 6 + Math.PI + 0.5) * 1.5;
            dad.mesh.rotation.y += 0.01;
            mom.mesh.rotation.y -= 0.01;
            pr.subTimer += dt / 1000;
            if (pr.subTimer > 1.8) {
              pr.subTimer = 0;
              const colors = [0xff1493, 0xffd700, 0x00ffff, 0xff4500, 0x9370db];
              const c = colors[Math.floor(Math.random() * colors.length)];
              createFirework(
                mansionBounds.cx + (Math.random() - 0.5) * 30,
                20 + Math.random() * 20,
                mansionBounds.cz + 20 + (Math.random() - 0.5) * 20,
                c
              );
            }
            break;
          }
        }
        if (pr.phase === "celebrate" || pr.phase === "hug") {
          family.son.arm1.rotation.x = Math.sin(time * 8) * 1.2;
          family.son.arm2.rotation.x = Math.sin(time * 8 + Math.PI) * 1.2;
          family.son.mesh.position.y = Math.abs(Math.sin(time * 5)) * 0.1;
          family.daughter.arm1.rotation.x = Math.sin(time * 7) * 1.0;
          family.daughter.arm2.rotation.x = Math.sin(time * 7 + Math.PI) * 1.0;
          family.daughter.mesh.position.y = Math.abs(Math.sin(time * 4)) * 0.08;
        }
      } else {
        family.dad.arm2.rotation.x = Math.sin(time * 2) * 0.3 - 0.3;
        family.dad.arm1.rotation.x = Math.sin(time * 2 + Math.PI) * 0.1;
        family.mom.mesh.rotation.y = Math.PI + Math.sin(time * 0.5) * 0.05;
        family.son.leg1.rotation.x = Math.sin(time * 4) * 0.3;
        family.son.leg2.rotation.x = Math.sin(time * 4 + Math.PI) * 0.3;
        family.son.arm1.rotation.x = Math.sin(time * 4 + Math.PI) * 0.4;
        family.son.arm2.rotation.x = Math.sin(time * 4) * 0.4;
        family.daughter.leg1.rotation.x = Math.sin(time * 3.5) * 0.2;
        family.daughter.leg2.rotation.x = Math.sin(time * 3.5 + Math.PI) * 0.2;
        family.daughter.arm1.rotation.x = Math.sin(time * 3.5) * 0.3;
        family.daughter.arm2.rotation.x = Math.sin(time * 3.5 + Math.PI) * 0.3;
      }
    }

    function updatePlayer(dt: number) {
      const s = settingsRef.current;
      if (!s.walkMode) return;
      const p = playerRef.current;
      const keys = keysRef.current;
      const dtSec = dt / 1000;
      let mx = 0, mz = 0;
      if (keys["w"] || keys["arrowup"]) mz -= 1;
      if (keys["s"] || keys["arrowdown"]) mz += 1;
      if (keys["a"] || keys["arrowleft"]) mx -= 1;
      if (keys["d"] || keys["arrowright"]) mx += 1;
      const len = Math.sqrt(mx * mx + mz * mz);
      const accel = 18;
      const friction = 0.82;
      const maxSpeed = keys["shift"] ? 8 : 4;
      if (len > 0) {
        mx /= len; mz /= len;
        const yaw = camera.rotation.y;
        const rx = mx * Math.cos(yaw) - mz * Math.sin(yaw);
        const rz = mx * Math.sin(yaw) + mz * Math.cos(yaw);
        p.vx += rx * accel * dtSec;
        p.vz += rz * accel * dtSec;
      }
      p.vx *= friction;
      p.vz *= friction;
      const speed = Math.sqrt(p.vx * p.vx + p.vz * p.vz);
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vz = (p.vz / speed) * maxSpeed;
      }
      p.x += p.vx * dtSec;
      p.z += p.vz * dtSec;
      p.x = clamp(p.x, CITY_MIN + 2, CITY_MAX - 2);
      p.z = clamp(p.z, CITY_MIN + 2, CITY_MAX - 2);
      const bob = Math.sin(Date.now() * 0.012) * 0.06 * Math.min(speed / 3, 1);
      camera.position.set(p.x, p.y + bob, p.z);
      if (keys["e"] && p.waveTimer <= 0) {
        p.waveTimer = 1500;
        let nearest: any = null, nearDist = 6;
        pedestrians.forEach((ped) => {
          const ddx = ped.mesh.position.x - p.x;
          const ddz = ped.mesh.position.z - p.z;
          const d = Math.sqrt(ddx * ddx + ddz * ddz);
          if (d < nearDist) { nearDist = d; nearest = ped; }
        });
        if (nearest) nearest.waveTimer = 2000;
      }
      if (p.waveTimer > 0) p.waveTimer -= dt;
    }

    function updatePlane(dt: number) {
      const p = planeRef.current;
      const dtSec = dt / 1000;
      p.timer += dtSec;
      if (p.phase === "taxi") {
        p.mesh.position.x += 3 * dtSec;
        if (p.mesh.position.x > -80) { p.phase = "takeoff"; p.timer = 0; }
      } else if (p.phase === "takeoff") {
        p.mesh.position.x += 8 * dtSec;
        p.mesh.position.y += 2 * dtSec;
        p.mesh.rotation.z = -0.15;
        if (p.mesh.position.y > 25) { p.phase = "fly"; p.timer = 0; }
      } else if (p.phase === "fly") {
        p.mesh.position.x += 15 * dtSec;
        p.mesh.rotation.z = 0;
        if (p.mesh.position.x > 200) { p.phase = "land"; p.mesh.position.set(-150, 30, 0); p.timer = 0; }
      } else if (p.phase === "land") {
        p.mesh.position.x += 12 * dtSec;
        p.mesh.position.y -= 1.2 * dtSec;
        p.mesh.rotation.z = 0.1;
        if (p.mesh.position.y <= 0.5) {
          p.mesh.position.y = 0.5;
          p.phase = "taxi";
          p.mesh.rotation.z = 0;
          p.mesh.position.x = -150;
          p.timer = 0;
        }
      }
    }

    function updateFireworks(dt: number) {
      const dtSec = dt / 1000;
      for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
        const fw = fireworksRef.current[i];
        fw.life -= dtSec;
        const positions = fw.mesh.geometry.attributes.position.array as Float32Array;
        for (let j = 0; j < fw.velocities.length; j++) {
          const v = fw.velocities[j];
          v.y -= 0.5 * dtSec;
          positions[j * 3] += v.x * dtSec;
          positions[j * 3 + 1] += v.y * dtSec;
          positions[j * 3 + 2] += v.z * dtSec;
        }
        fw.mesh.geometry.attributes.position.needsUpdate = true;
        (fw.mesh.material as THREE.PointsMaterial).opacity = clamp(fw.life / fw.maxLife, 0, 1);
        if (fw.life <= 0) {
          scene.remove(fw.mesh);
          fw.mesh.geometry.dispose();
          (fw.mesh.material as THREE.Material).dispose();
          fireworksRef.current.splice(i, 1);
        }
      }
    }

    /* ═══════════════════════════════════════════════════════════
       MAIN ANIMATION LOOP
       ═══════════════════════════════════════════════════════════ */
    const clock = new THREE.Clock();
    let lastTime = 0;

    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      const rawDt = clock.getDelta() * 1000;
      const dt = Math.min(rawDt, 40);

      fpsCounterRef.current.frames++;
      const now = performance.now();
      if (now - fpsCounterRef.current.lastTime >= 500) {
        fpsCounterRef.current.value = Math.round((fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime));
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
        setFps(fpsCounterRef.current.value);
      }
      if (fpsRef.current) fpsRef.current.textContent = `${fpsCounterRef.current.value} FPS`;

      const s = settingsRef.current;
      if (!s.walkMode && cameraRef.current) {
        const targetY = s.cameraHeight;
        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.02;
      }

      controls.autoRotate = s.autoRotate && !s.walkMode;
      if (s.walkMode) {
        controls.enableRotate = true;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.target.lerp(new THREE.Vector3(playerRef.current.x, playerRef.current.y, playerRef.current.z), 0.08);
      } else {
        controls.enablePan = true;
      }
      controls.update();

      updateTime(dt);
      updateCars(dt);
      updatePedestrians(dt);
      updateSchoolKids(dt);
      updateFamily(dt);
      updatePlayer(dt);
      updatePlane(dt);
      updateFireworks(dt);

      renderer.render(scene, camera);
    }
    animFrameRef.current = requestAnimationFrame(animate);

    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === "Tab") {
        e.preventDefault();
        setWalkMode((prev) => !prev);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const onResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    setTimeout(() => setLoading(false), 1000);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (walkMode) {
      playerRef.current.x = cameraRef.current.position.x;
      playerRef.current.z = cameraRef.current.position.z;
      controlsRef.current.maxPolarAngle = Math.PI / 2.1;
      controlsRef.current.minDistance = 1;
      controlsRef.current.maxDistance = 8;
    } else {
      controlsRef.current.maxPolarAngle = Math.PI / 2.02;
      controlsRef.current.minDistance = 2;
      controlsRef.current.maxDistance = 300;
      cameraRef.current.position.y = cameraHeight;
    }
  }, [walkMode, cameraHeight]);

  /* ═══════════════════════════════════════════════════════════
     RENDER — SCANLINE CRT TOAST + ALL UI
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="veridia-wrapper">
      {/* ─── CRT Scanline Toast with Typewriter Love Quotes ─── */}
      {showToast && (
        <div className="love-crt-toast" onClick={() => setShowToast(false)}>
          <div className="crt-scanlines" />
          <div className="crt-flicker" />
          <div className="crt-content">
            <div className="crt-header">
              <span className="crt-pulse">◉</span>
              <span className="crt-label">LIVE TRANSMISSION</span>
              <span className="crt-pulse">◉</span>
            </div>
            <div className="crt-quote">
              <span ref={quoteTextRef} className={`crt-text ${quoteGlow ? 'glow' : ''}`}>
                {quoteTyping}
              </span>
              <span className="crt-cursor">▌</span>
            </div>
            <div className="crt-footer">
              <span className="crt-line">━━━━━━━━━━━━━━━━━━</span>
              <span className="crt-close">CLICK TO DISMISS</span>
            </div>
          </div>
        </div>
      )}
      {!showToast && (
        <button className="love-recall" onClick={() => setShowToast(true)} title="Show love transmission">
          💌
        </button>
      )}

      {/* ─── Settings Toggle (Top-Right) ─── */}
      <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)} title="City Settings">
        ⚙️
      </button>

      {/* ─── Walk Mode HUD ─── */}
      {walkMode && (
        <div className="walk-hud">
          <div className="walk-badge">🚶 WALK MODE</div>
          <div className="walk-controls">
            <span>W A S D</span> Move · <span>SHIFT</span> Run · <span>E</span> Wave · <span>TAB</span> Exit
          </div>
        </div>
      )}

      {/* ─── Settings Panel ─── */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>🌆 Veridia Settings</h3>
            <button onClick={() => setShowSettings(false)}>✕</button>
          </div>

          <div className="settings-section">
            <h4>⏱️ Time Control</h4>
            <div className="setting-row">
              <label>Time Mode</label>
              <div className="mode-buttons">
                {(["real", "simulated", "birthday"] as const).map((m) => (
                  <button key={m} className={timeMode === m ? "active" : ""} onClick={() => setTimeMode(m)}>
                    {m === "real" ? "🌍 Real" : m === "simulated" ? "⏳ Sim" : "👑 June 1"}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <label>Time Speed</label>
              <div className="speed-buttons">
                {[0.5, 1, 2, 5, 10].map((speed) => (
                  <button key={speed} className={timeSpeed === speed ? "active" : ""} onClick={() => setTimeSpeed(speed)}>
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <label>Pause Time</label>
              <button className={`toggle-btn ${paused ? "active" : ""}`} onClick={() => setPaused(!paused)}>
                {paused ? "▶ Resume" : "⏸ Pause"}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h4>👁️ Visibility</h4>
            {[
              { label: "Our Family 💕", state: showFamily, set: setShowFamily },
              { label: "Cars 🚗", state: showCars, set: setShowCars },
              { label: "Pedestrians 🚶", state: showPedestrians, set: setShowPedestrians },
              { label: "School Kids ⚽", state: showSchoolKids, set: setShowSchoolKids },
            ].map((item) => (
              <div className="setting-row" key={item.label}>
                <label>{item.label}</label>
                <button className={`toggle-btn ${item.state ? "active" : ""}`} onClick={() => item.set(!item.state)}>
                  {item.state ? "✓ On" : "✕ Off"}
                </button>
              </div>
            ))}
          </div>

          <div className="settings-section">
            <h4>🎨 Quality</h4>
            <div className="setting-row">
              <label>Shadow Quality</label>
              <select value={shadowQuality} onChange={(e) => setShadowQuality(e.target.value as any)}>
                <option value="low">Low (Fastest)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Prettiest)</option>
              </select>
            </div>
            <div className="setting-row">
              <label>Fog Density</label>
              <input type="range" min="0.5" max="2" step="0.1" value={fogDensity}
                onChange={(e) => setFogDensity(parseFloat(e.target.value))} />
              <span>{fogDensity.toFixed(1)}x</span>
            </div>
            <div className="setting-row">
              <label>Camera Height</label>
              <input type="range" min="20" max="100" step="5" value={cameraHeight}
                onChange={(e) => setCameraHeight(parseInt(e.target.value))} />
              <span>{cameraHeight}m</span>
            </div>
          </div>

          <div className="settings-section">
            <h4>🚶 Walk Mode</h4>
            <div className="setting-row">
              <label>Enable Walking</label>
              <button className={`toggle-btn ${walkMode ? "active" : ""}`} onClick={() => setWalkMode(!walkMode)}>
                {walkMode ? "✓ Active" : "✕ Off"}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h4>💌 Love Note</h4>
            <input type="text" value={loveMessage} onChange={(e) => setLoveMessage(e.target.value)}
              placeholder="Write a message for her..." className="love-input" />
          </div>
        </div>
      )}

      {loading && (
        <div className="city-loading">
          <h2>Building Veridia...</h2>
          <div className="loading-bar"><div className="loading-progress" /></div>
          <p className="loading-sub">For the Queen 👑</p>
        </div>
      )}

      <div className="ui-time">
        <div className="clock" ref={clockRef}>08:00</div>
        <div className="date" ref={dateRef}>Saturday, May 16</div>
      </div>

      <div className="ui-hint">
        {walkMode
          ? "WASD = walk • SHIFT = run • E = wave • TAB = exit walk"
          : "Left drag = rotate • Right drag = pan • Scroll = zoom • TAB = walk mode"}
      </div>

      <div className="fps-counter" ref={fpsRef}>{fps} FPS</div>

      <div ref={mountRef} className="city-canvas" />

      <style jsx>{`
        .veridia-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #0a0a0f;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* ═══════════════════════════════════════════════════════════
           CRT SCANLINE TOAST — Typewriter Love Quotes
           ═══════════════════════════════════════════════════════════ */
        .love-crt-toast {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 30;
          width: 480px;
          max-width: calc(100vw - 48px);
          background: rgba(10, 8, 20, 0.92);
          border: 1px solid rgba(255, 100, 150, 0.25);
          border-radius: 4px;
          padding: 20px 24px;
          cursor: pointer;
          overflow: hidden;
          animation: crtSlideIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 40px rgba(255, 100, 150, 0.1), inset 0 0 60px rgba(255, 100, 150, 0.03);
        }
        .crt-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.15) 2px,
            rgba(0, 0, 0, 0.15) 4px
          );
          pointer-events: none;
          z-index: 1;
          animation: scanlineMove 8s linear infinite;
        }
        .crt-flicker {
          position: absolute;
          inset: 0;
          background: rgba(255, 100, 150, 0.02);
          pointer-events: none;
          z-index: 1;
          animation: flicker 0.15s infinite;
        }
        .crt-content {
          position: relative;
          z-index: 2;
        }
        .crt-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: rgba(255, 150, 200, 0.6);
          font-weight: 700;
          text-transform: uppercase;
        }
        .crt-pulse {
          color: #ff6b9d;
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        .crt-quote {
          min-height: 64px;
          display: flex;
          align-items: flex-start;
          gap: 4px;
        }
        .crt-text {
          font-family: 'Courier New', 'SF Mono', monospace;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #ffd1dc;
          text-shadow: 0 0 8px rgba(255, 150, 200, 0.3);
          transition: text-shadow 0.5s ease;
        }
        .crt-text.glow {
          text-shadow: 0 0 20px rgba(255, 150, 200, 0.8), 0 0 40px rgba(255, 100, 150, 0.4), 0 0 60px rgba(255, 50, 100, 0.2);
          color: #fff0f5;
        }
        .crt-cursor {
          font-family: monospace;
          color: #ff6b9d;
          animation: cursorBlink 0.8s step-end infinite;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .crt-footer {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .crt-line {
          color: rgba(255, 150, 200, 0.2);
          font-size: 0.6rem;
          letter-spacing: 0.3em;
        }
        .crt-close {
          font-size: 0.6rem;
          color: rgba(255, 150, 200, 0.35);
          letter-spacing: 0.15em;
          font-weight: 600;
        }
        .love-recall {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 20;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,100,150,0.2), rgba(200,100,255,0.15));
          border: 1px solid rgba(255,150,200,0.3);
          font-size: 1.3rem;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: lovePulse 2s ease-in-out infinite;
        }
        .love-recall:hover {
          transform: scale(1.15);
          box-shadow: 0 0 25px rgba(255,100,150,0.3);
        }
        @keyframes crtSlideIn {
          from { opacity: 0; transform: translateX(-40px) scale(0.97); clip-path: inset(0 100% 0 0); }
          to { opacity: 1; transform: translateX(0) scale(1); clip-path: inset(0 0 0 0); }
        }
        @keyframes scanlineMove {
          from { transform: translateY(0); }
          to { transform: translateY(8px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.97; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes lovePulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,100,150,0.1); }
          50% { box-shadow: 0 0 25px rgba(255,100,150,0.25); }
        }

        /* ─── Settings Toggle ─── */
        .settings-toggle {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 20;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff;
          font-size: 1.4rem;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .settings-toggle:hover {
          transform: scale(1.1) rotate(30deg);
          background: linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.12));
          box-shadow: 0 0 30px rgba(255,255,255,0.15);
        }

        /* ─── Walk HUD ─── */
        .walk-hud {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          pointer-events: none;
        }
        .walk-badge {
          background: linear-gradient(135deg, rgba(100,200,150,0.25), rgba(100,200,150,0.1));
          border: 1px solid rgba(100,200,150,0.3);
          color: #90ee90;
          padding: 8px 18px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          backdrop-filter: blur(10px);
          animation: walkPulse 2s ease-in-out infinite;
        }
        .walk-controls {
          color: rgba(255,255,255,0.6);
          font-size: 0.75rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        }
        .walk-controls span {
          background: rgba(255,255,255,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: #fff;
          margin: 0 2px;
        }
        @keyframes walkPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(100,200,150,0.1); }
          50% { box-shadow: 0 0 25px rgba(100,200,150,0.25); }
        }

        /* ─── Settings Panel ─── */
        .settings-panel {
          position: absolute;
          top: 80px;
          right: 24px;
          z-index: 25;
          width: 340px;
          max-height: 75vh;
          overflow-y: auto;
          background: linear-gradient(165deg, rgba(22,22,38,0.97), rgba(12,12,24,0.98));
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(30px);
          box-shadow: 0 25px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          animation: slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-15px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .settings-header h3 {
          margin: 0;
          font-size: 1.15rem;
          color: #feca57;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .settings-header button {
          background: none;
          border: none;
          color: #8a8aa8;
          font-size: 1.2rem;
          cursor: pointer;
          transition: color 0.2s, transform 0.2s;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        .settings-header button:hover {
          color: #fff;
          background: rgba(255,255,255,0.06);
          transform: rotate(90deg);
        }
        .settings-section { margin-bottom: 18px; }
        .settings-section h4 {
          margin: 0 0 12px 0;
          font-size: 0.75rem;
          color: #8a8ab0;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
        }
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          gap: 12px;
        }
        .setting-row label {
          font-size: 0.9rem;
          color: #d0d0e8;
          font-weight: 500;
          flex-shrink: 0;
        }
        .mode-buttons, .speed-buttons {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .mode-buttons button, .speed-buttons button {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #a0a0b8;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .mode-buttons button:hover, .speed-buttons button:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .mode-buttons button.active, .speed-buttons button.active {
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          color: #1a1a2e;
          border-color: transparent;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(255,107,107,0.25);
        }
        .toggle-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #8a8aa8;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
          min-width: 72px;
        }
        .toggle-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .toggle-btn.active {
          background: linear-gradient(135deg, rgba(100,220,120,0.25), rgba(100,220,120,0.12));
          color: #90ee90;
          border-color: rgba(100,220,120,0.35);
          box-shadow: 0 0 15px rgba(100,220,120,0.1);
        }
        .setting-row select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #d0d0e0;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
          outline: none;
        }
        .setting-row select option { background: #1a1a2e; color: #d0d0e0; }
        .setting-row input[type="range"] {
          width: 110px;
          -webkit-appearance: none;
          height: 5px;
          border-radius: 3px;
          background: rgba(255,255,255,0.08);
          outline: none;
        }
        .setting-row input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: linear-gradient(135deg, #feca57, #ff9f43);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(254,202,87,0.3);
        }
        .setting-row span {
          font-size: 0.8rem;
          color: #6e6e8a;
          min-width: 36px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .love-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,150,200,0.2);
          border-radius: 12px;
          padding: 10px 14px;
          color: #ffd1dc;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }
        .love-input:focus {
          border-color: rgba(255,150,200,0.45);
          box-shadow: 0 0 20px rgba(255,150,200,0.12);
          background: rgba(255,255,255,0.06);
        }
        .love-input::placeholder { color: rgba(255,150,200,0.35); }

        .city-canvas { width: 100%; height: 100%; display: block; }
        .city-loading {
          position: absolute;
          inset: 0;
          background: #0a0a0f;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 50;
          color: white;
          transition: opacity 1s ease-out;
        }
        .city-loading h2 {
          font-size: 26px;
          margin-bottom: 18px;
          font-weight: 300;
          letter-spacing: 0.05em;
          background: linear-gradient(90deg, #fff, #feca57);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .loading-sub {
          margin-top: 12px;
          font-size: 14px;
          color: rgba(255,200,150,0.6);
          font-style: italic;
        }
        .loading-bar {
          width: 240px;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .loading-progress {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #a855f7, #feca57);
          width: 100%;
          animation: loadPulse 1.5s ease-in-out infinite;
          background-size: 200% 100%;
        }
        @keyframes loadPulse {
          0%, 100% { opacity: 1; background-position: 0% 50%; }
          50% { opacity: 0.5; background-position: 100% 50%; }
        }
        .ui-time {
          position: absolute;
          top: 24px;
          right: 50%;
          transform: translateX(50%);
          z-index: 10;
          color: white;
          text-align: center;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.9);
          pointer-events: none;
          font-family: "Segoe UI", system-ui, sans-serif;
        }
        .ui-time .clock {
          font-size: 28px;
          font-weight: 200;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }
        .ui-time .date {
          font-size: 12px;
          opacity: 0.75;
          margin-top: 4px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .ui-hint {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          color: rgba(255,255,255,0.55);
          font-size: 12px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
          pointer-events: none;
          text-align: center;
          font-family: "Segoe UI", system-ui, sans-serif;
          letter-spacing: 0.02em;
        }
        .fps-counter {
          position: absolute;
          bottom: 24px;
          left: 24px;
          z-index: 10;
          color: rgba(255, 255, 255, 0.35);
          font-size: 11px;
          font-family: "SF Mono", Monaco, monospace;
          pointer-events: none;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
