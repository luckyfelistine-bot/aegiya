"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ═══════════════════════════════════════════════════════════════
   VERIDIA CITY — A Love Letter in Code 💌
   Built for: The One I Want to Spend My Life With
   ═══════════════════════════════════════════════════════════════ */

export default function VeridiaCity() {
  const mountRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // ─── Settings State ───
  const [showSettings, setShowSettings] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [showFamily, setShowFamily] = useState(true);
  const [showCars, setShowCars] = useState(true);
  const [showPedestrians, setShowPedestrians] = useState(true);
  const [showSchoolKids, setShowSchoolKids] = useState(true);
  const [shadowQuality, setShadowQuality] = useState<"low" | "medium" | "high">("medium");
  const [fogDensity, setFogDensity] = useState(1);
  const [cameraHeight, setCameraHeight] = useState(45);
  const [loveMessage, setLoveMessage] = useState("For My Love — Forever & Always 💕");
  const [showDedication, setShowDedication] = useState(true);

  // Ref for animation loop to read settings without re-renders
  const settingsRef = useRef({
    timeSpeed: 1,
    paused: false,
    showFamily: true,
    showCars: true,
    showPedestrians: true,
    showSchoolKids: true,
    fogDensity: 1,
  });

  useEffect(() => {
    settingsRef.current = {
      timeSpeed, paused, showFamily, showCars, showPedestrians, showSchoolKids, fogDensity,
    };
  }, [timeSpeed, paused, showFamily, showCars, showPedestrians, showSchoolKids, fogDensity]);

  // Update refs when settings change
  useEffect(() => {
    settingsRef.current = { timeSpeed, paused, showFamily, showCars, showPedestrians, showSchoolKids, fogDensity };
  }, [timeSpeed, paused, showFamily, showCars, showPedestrians, showSchoolKids, fogDensity]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const ROAD_WIDTH = 8;
    const LANE_OFFSET = 1.8;
    const ROAD_CENTERS = [-60, -20, 20, 60];
    const CITY_MIN = -80;
    const CITY_MAX = 80;
    const HOUSE_W = 10;
    const HOUSE_D = 8;
    const HOUSE_H = 3.5;
    const DAY_SECONDS = 90;

    const sharedGeo = {
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(1, 8, 6),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 8),
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 120 * settingsRef.current.fogDensity, 350 * settingsRef.current.fogDensity);
    // scene.autoUpdate removed - not available in this Three.js version

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(50, cameraHeight, 50);
    camera.matrixAutoUpdate = false;
    camera.updateMatrix();

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.info.autoReset = false;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 5;
    controls.maxDistance = 250;
    controls.target.set(0, 0, 0);
    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.3);
    sunLight.position.set(60, 90, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 300;
    const S = 100;
    sunLight.shadow.camera.left = -S;
    sunLight.shadow.camera.right = S;
    sunLight.shadow.camera.top = S;
    sunLight.shadow.camera.bottom = -S;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const M: Record<string, THREE.MeshStandardMaterial> = {
      road: new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.95 }),
      roadLine: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }),
      sidewalk: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.85 }),
      grass: new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 0.9 }),
      water: new THREE.MeshStandardMaterial({ color: 0x1e6ba8, roughness: 0.1, metalness: 0.3 }),
      wallBeige: new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.7 }),
      wallWhite: new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.7 }),
      wallBrick: new THREE.MeshStandardMaterial({ color: 0xc4553a, roughness: 0.85 }),
      wallBlue: new THREE.MeshStandardMaterial({ color: 0x7aa8d0, roughness: 0.7 }),
      wallYellow: new THREE.MeshStandardMaterial({ color: 0xf0e68c, roughness: 0.7 }),
      roof: new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.9 }),
      roofDark: new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.8, metalness: 0.2 }),
      roofRed: new THREE.MeshStandardMaterial({ color: 0x8b2e1f, roughness: 0.85 }),
      roofBlue: new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.8 }),
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
      shoes: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 }),
      ball: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
      ballStripe: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }),
      fence: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.6 }),
      schoolWall: new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 }),
      schoolRoof: new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.85 }),
    };

    function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, cast = true, receive = true) {
      const m = new THREE.Mesh(sharedGeo.box, mat);
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

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), M.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    ground.matrixAutoUpdate = false;
    ground.updateMatrix();
    scene.add(ground);

    const roads: any[] = [];
    const intersections: any[] = [];

    ROAD_CENTERS.forEach((zc) => {
      const g = new THREE.Group();
      g.add(box(160, 0.12, ROAD_WIDTH, M.road, 0, 0.06, 0, false, true));
      for (let x = -78; x < 80; x += 6) {
        g.add(box(3, 0.13, 0.12, M.roadLine, x, 0.065, 0, false, false));
      }
      g.add(box(160, 0.22, 1.5, M.sidewalk, 0, 0.11, -ROAD_WIDTH / 2 - 0.75, false, true));
      g.add(box(160, 0.22, 1.5, M.sidewalk, 0, 0.11, ROAD_WIDTH / 2 + 0.75, false, true));
      g.position.set(0, 0, zc);
      scene.add(g);
      roads.push({ type: "h", center: zc, z: zc });
    });

    ROAD_CENTERS.forEach((xc) => {
      const g = new THREE.Group();
      g.add(box(ROAD_WIDTH, 0.12, 160, M.road, 0, 0.06, 0, false, true));
      for (let z = -78; z < 80; z += 6) {
        g.add(box(0.12, 0.13, 3, M.roadLine, 0, 0.065, z, false, false));
      }
      g.add(box(1.5, 0.22, 160, M.sidewalk, -ROAD_WIDTH / 2 - 0.75, 0.11, 0, false, true));
      g.add(box(1.5, 0.22, 160, M.sidewalk, ROAD_WIDTH / 2 + 0.75, 0.11, 0, false, true));
      g.position.set(xc, 0, 0);
      scene.add(g);
      roads.push({ type: "v", center: xc, x: xc });
    });

    ROAD_CENTERS.forEach((xc) => {
      ROAD_CENTERS.forEach((zc) => {
        intersections.push({ x: xc, z: zc });
        const patch = box(ROAD_WIDTH, 0.11, ROAD_WIDTH, M.road, xc, 0.055, zc, false, true);
        scene.add(patch);
      });
    });

    function getBlockBounds(col: number, row: number) {
      const left = ROAD_CENTERS[col] + ROAD_WIDTH / 2;
      const right = ROAD_CENTERS[col + 1] - ROAD_WIDTH / 2;
      const bottom = ROAD_CENTERS[row] + ROAD_WIDTH / 2;
      const top = ROAD_CENTERS[row + 1] - ROAD_WIDTH / 2;
      return { left, right, bottom, top, cx: (left + right) / 2, cz: (bottom + top) / 2 };
    }

    function createHouse(x: number, z: number, wallMat: THREE.Material, roofMat: THREE.Material) {
      const g = new THREE.Group();
      const w = HOUSE_W;
      const d = HOUSE_D;
      const h = HOUSE_H;
      g.add(box(w, h, d, wallMat, 0, h / 2, 0));
      const roofH = 1.2;
      const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.65, roofH, 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = h + roofH / 2;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      g.add(roof);
      g.add(box(1.2, 2.0, 0.12, M.door, 0, 1.0, d / 2 + 0.06));
      g.add(box(1.6, 0.15, 0.8, M.sidewalk, 0, 0.075, d / 2 + 0.5));
      const winW = 1.2;
      const winH = 1.0;
      const winD = 0.08;
      g.add(box(winW, winH, winD, M.window, -2.5, h / 2 + 0.3, d / 2 + 0.04));
      g.add(box(winW, winH, winD, M.window, 2.5, h / 2 + 0.3, d / 2 + 0.04));
      g.add(box(winW, winH, winD, M.window, -2.5, h / 2 + 0.3, -d / 2 - 0.04));
      g.add(box(winW, winH, winD, M.window, 2.5, h / 2 + 0.3, -d / 2 - 0.04));
      g.add(box(0.6, 1.2, 0.6, new THREE.MeshStandardMaterial({ color: 0x666666 }), w / 3, h + 0.6, -d / 4));
      g.position.set(x, 0, z);
      scene.add(g);
    }

    function createTree(x: number, z: number, parent: THREE.Object3D = scene) {
      const s = 0.7 + Math.random() * 0.4;
      const g = new THREE.Group();
      g.add(cylinder(0.15, 0.2, 1.8, 6, M.treeTrunk, 0, 0.9, 0));
      const l1 = new THREE.Mesh(sharedGeo.sphere, M.treeLeaves);
      l1.scale.set(1.3, 1.3, 1.3);
      l1.position.set(0, 2.4, 0);
      l1.castShadow = true;
      g.add(l1);
      const l2 = new THREE.Mesh(sharedGeo.sphere, M.treeLeaves2);
      l2.scale.set(0.9, 0.9, 0.9);
      l2.position.set(0.3, 3.0, 0.2);
      l2.castShadow = true;
      g.add(l2);
      g.position.set(x, 0, z);
      g.scale.set(s, s, s);
      parent.add(g);
    }

    const houseWallColors = [M.wallBeige, M.wallWhite, M.wallBrick, M.wallBlue, M.wallYellow];
    const houseRoofColors = [M.roof, M.roofDark, M.roofRed, M.roofBlue];

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

    const parkBounds = getBlockBounds(1, 1);
    const parkGround = box(
      parkBounds.right - parkBounds.left,
      0.08,
      parkBounds.top - parkBounds.bottom,
      new THREE.MeshStandardMaterial({ color: 0x5a9e4f, roughness: 0.9 }),
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
    bench.add(box(2.2, 0.08, 0.5, M.roof, 0, 0.5, 0));
    bench.add(box(0.08, 0.5, 0.5, M.metal, -1.0, 0.25, 0));
    bench.add(box(0.08, 0.5, 0.5, M.metal, 1.0, 0.25, 0));
    bench.position.set(parkBounds.cx, 0, parkBounds.cz + 8);
    scene.add(bench);

    const schoolBounds = getBlockBounds(1, 2);
    const sg = new THREE.Group();
    sg.add(box(18, 4.5, 10, M.schoolWall, 0, 2.25, 0));
    sg.add(box(18, 0.3, 10, M.schoolRoof, 0, 4.65, 0));
    sg.add(box(10, 3.5, 8, M.schoolWall, -12, 1.75, -6));
    sg.add(box(10, 0.3, 8, M.schoolRoof, -12, 3.65, -6));
    sg.add(box(3, 2.8, 0.15, M.doorGlass, 0, 1.4, 5.08));
    sg.add(box(3.4, 0.15, 0.25, M.metal, 0, 2.85, 5.1));
    for (let i = -2; i <= 2; i++) {
      sg.add(box(1.8, 2.2, 0.1, M.window, i * 3.2, 2.5, 5.05));
    }
    sg.add(box(20, 0.2, 2, M.sidewalk, 0, 0.1, 7));
    sg.position.set(schoolBounds.cx, 0, schoolBounds.cz);
    scene.add(sg);

    const fieldZ = schoolBounds.cz + 18;
    const field = box(28, 0.1, 18, M.grass, schoolBounds.cx, 0.05, fieldZ, false, true);
    scene.add(field);
    scene.add(box(26, 0.12, 0.08, M.roadLine, schoolBounds.cx, 0.06, fieldZ - 8));
    scene.add(box(26, 0.12, 0.08, M.roadLine, schoolBounds.cx, 0.06, fieldZ + 8));
    scene.add(box(0.08, 0.12, 18, M.roadLine, schoolBounds.cx - 13, 0.06, fieldZ));
    scene.add(box(0.08, 0.12, 18, M.roadLine, schoolBounds.cx + 13, 0.06, fieldZ));
    const ringGeo = new THREE.RingGeometry(2.8, 3.0, 32);
    const ring = new THREE.Mesh(ringGeo, M.roadLine);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(schoolBounds.cx, 0.07, fieldZ);
    scene.add(ring);

    function createGoal(gx: number, gz: number) {
      const gg = new THREE.Group();
      gg.add(box(0.1, 2.2, 0.1, M.metal, -3.5, 1.1, 0));
      gg.add(box(0.1, 2.2, 0.1, M.metal, 3.5, 1.1, 0));
      gg.add(box(7.2, 0.1, 0.1, M.metal, 0, 2.2, 0));
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

    // Football
    const ball = new THREE.Group();
    ball.add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), M.ball));
    const stripe1 = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 16), M.ballStripe);
    stripe1.rotation.x = Math.PI / 2;
    ball.add(stripe1);
    const stripe2 = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 16), M.ballStripe);
    stripe2.rotation.x = 0;
    ball.add(stripe2);
    ball.position.set(schoolBounds.cx, 0.25, fieldZ);
    scene.add(ball);
    const ballState = { x: schoolBounds.cx, z: fieldZ, vx: 0, vz: 0 };

    // ==================== TIME SYSTEM ====================
    let timeOfDay = 9.0;

    function updateTime(dt: number) {
      const s = settingsRef.current;
      timeOfDay += (dt / 1000) * (24 / DAY_SECONDS) * s.timeSpeed;
      if (timeOfDay >= 24) timeOfDay -= 24;

      const hours = Math.floor(timeOfDay);
      const minutes = Math.floor((timeOfDay - hours) * 60);
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      if (clockRef.current) clockRef.current.textContent = timeStr;

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const now = new Date();
      const dateStr = `${days[now.getDay()]}, ${now.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
      if (dateRef.current) dateRef.current.textContent = dateStr;

      let skyColor: THREE.Color | number, sunInt: number, ambInt: number;
      if (!s.dayNightCycle) {
        skyColor = 0x87ceeb; sunInt = 1.3; ambInt = 0.5;
      } else if (timeOfDay < 5 || timeOfDay > 20) {
        skyColor = 0x0a0a1a; sunInt = 0; ambInt = 0.12;
      } else if (timeOfDay < 7) {
        const t = (timeOfDay - 5) / 2;
        skyColor = new THREE.Color(0x0a0a1a).lerp(new THREE.Color(0xffaa77), t);
        sunInt = t * 1.3; ambInt = 0.12 + t * 0.35;
      } else if (timeOfDay < 17) {
        skyColor = 0x87ceeb; sunInt = 1.3; ambInt = 0.5;
      } else if (timeOfDay < 20) {
        const t = (timeOfDay - 17) / 3;
        skyColor = new THREE.Color(0x87ceeb).lerp(new THREE.Color(0x0a0a1a), t);
        sunInt = 1.3 * (1 - t); ambInt = 0.5 * (1 - t) + 0.12 * t;
      } else {
        skyColor = 0x0a0a1a; sunInt = 0; ambInt = 0.12;
      }

      const hex = skyColor instanceof THREE.Color ? skyColor.getHex() : skyColor;
      scene.background = new THREE.Color(hex);
      if (s.fog) {
        scene.fog = new THREE.Fog(hex, 120, 350);
      } else {
        scene.fog = null;
      }
      sunLight.intensity = sunInt;
      ambientLight.intensity = ambInt;
      sunLight.castShadow = s.shadows;

      const angle = ((timeOfDay - 6) / 12) * Math.PI;
      sunLight.position.set(Math.cos(angle) * 100, Math.sin(angle) * 70, 40);

      const isNight = timeOfDay < 6 || timeOfDay > 19;
      streetLights.forEach((sl) => {
        sl.light.intensity = (isNight && s.showStreetLights) ? 1.5 : 0;
        sl.bulb.material.emissiveIntensity = (isNight && s.showStreetLights) ? 1 : 0;
      });
    }

    // ==================== CAR UPDATE ====================
    function updateCars(dt: number) {
      const s = settingsRef.current;
      if (!s.showCars) {
        cars.forEach((car) => { car.mesh.visible = false; });
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
            if (dist > 0 && dist < 12) targetSpeed = Math.min(targetSpeed, other.speed * 0.8);
          }

          if (nearestIx && nearestDist < 14) {
            const rand = Math.random();
            let turn = "straight";
            if (rand < 0.25) turn = "right";
            else if (rand < 0.4) turn = "left";
            if (turn !== "straight" && nearestIx) {
              const curve = getTurnCurve(nearestIx.x, nearestIx.z, car.lane, turn);
              car.state = "turning";
              car.turnData = { ...curve, elapsed: 0, duration: 2.5 };
              return;
            } else if (nearestDist < 8) {
              targetSpeed = Math.min(targetSpeed, 0.04);
            }
          }

          car.speed += (targetSpeed - car.speed) * 0.08;
          const move = car.speed * dtSec * 30;
          if (car.lane.type === "h") {
            car.pos += car.lane.dir * move;
            car.mesh.position.x = car.pos;
            car.mesh.position.z = car.lane.z;
            car.mesh.rotation.y = car.lane.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
          } else {
            car.pos += car.lane.dir * move;
            car.mesh.position.z = car.pos;
            car.mesh.position.x = car.lane.x;
            car.mesh.rotation.y = car.lane.dir > 0 ? 0 : Math.PI;
          }
          if (car.pos > CITY_MAX + 5) car.pos = CITY_MIN - 5;
          if (car.pos < CITY_MIN - 5) car.pos = CITY_MAX + 5;
        } else if (car.state === "turning") {
          const td = car.turnData;
          td.elapsed += dtSec;
          let t = td.elapsed / td.duration;
          if (t > 1) t = 1;
          const omt = 1 - t;
          const x = omt * omt * td.startX + 2 * omt * t * td.cx + t * t * td.endX;
          const z = omt * omt * td.startZ + 2 * omt * t * td.cz + t * t * td.endZ;
          car.mesh.position.set(x, 0, z);
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
        const wheelSpeed = car.speed * 15;
        car.wheels.forEach((w: any) => {
          w.children.forEach((c: any) => {
            if (c.geometry && c.geometry.type === "CylinderGeometry") c.rotation.x += wheelSpeed * dtSec;
          });
        });
      });
    }

    // ==================== PEDESTRIANS ====================
    function updatePedestrians(dt: number) {
      const s = settingsRef.current;
      pedestrians.forEach((p) => {
        p.mesh.visible = s.showPedestrians;
        if (!s.showPedestrians) return;
        if (p.waitTime > 0) {
          p.waitTime -= dt;
          p.arm1.rotation.x = Math.sin(Date.now() * 0.002) * 0.1;
          p.arm2.rotation.x = Math.sin(Date.now() * 0.002 + Math.PI) * 0.1;
          return;
        }
        const dx = p.targetX - p.mesh.position.x;
        const dz = p.targetZ - p.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.5) {
          p.targetX = p.mesh.position.x + (Math.random() - 0.5) * 30;
          p.targetZ = p.mesh.position.z + (Math.random() - 0.5) * 30;
          p.targetX = Math.max(CITY_MIN + 5, Math.min(CITY_MAX - 5, p.targetX));
          p.targetZ = Math.max(CITY_MIN + 5, Math.min(CITY_MAX - 5, p.targetZ));
          p.waitTime = Math.random() * 2500;
        } else {
          const move = p.speed * s.pedestrianSpeed * (dt / 16);
          p.mesh.position.x += (dx / dist) * move;
          p.mesh.position.z += (dz / dist) * move;
          p.mesh.rotation.y = Math.atan2(dx, dz);
          const cycle = Date.now() * 0.007;
          p.leg1.rotation.x = Math.sin(cycle) * 0.6;
          p.leg2.rotation.x = Math.sin(cycle + Math.PI) * 0.6;
          p.arm1.rotation.x = Math.sin(cycle + Math.PI) * 0.5;
          p.arm2.rotation.x = Math.sin(cycle) * 0.5;
        }
      });
    }

    // ==================== SCHOOL KIDS ====================
    function updateSchoolKids(dt: number) {
      const s = settingsRef.current;
      const time = Date.now() * 0.001;
      schoolKids.forEach((kid, i) => {
        kid.mesh.visible = s.showPedestrians;
        if (!s.showPedestrians) return;
        if (kid.waitTime > 0) {
          kid.waitTime -= dt;
          kid.arm1.rotation.x = Math.sin(time * 3 + i) * 0.3;
          kid.arm2.rotation.x = Math.sin(time * 3 + i + Math.PI) * 0.3;
          return;
        }
        const bdx = ballState.x - kid.mesh.position.x;
        const bdz = ballState.z - kid.mesh.position.z;
        const bdist = Math.sqrt(bdx * bdx + bdz * bdz);
        if (bdist > 1.5 && Math.random() < 0.3) {
          const runSpeed = kid.speed * 1.5 * s.pedestrianSpeed;
          const move = runSpeed * (dt / 16);
          kid.mesh.position.x += (bdx / bdist) * move;
          kid.mesh.position.z += (bdz / bdist) * move;
          kid.mesh.rotation.y = Math.atan2(bdx, bdz);
          const rc = time * 10;
          kid.leg1.rotation.x = Math.sin(rc) * 0.8;
          kid.leg2.rotation.x = Math.sin(rc + Math.PI) * 0.8;
          kid.arm1.rotation.x = Math.sin(rc + Math.PI) * 0.7;
          kid.arm2.rotation.x = Math.sin(rc) * 0.7;
          if (bdist < 1.0) {
            ballState.vx += (bdx / bdist) * 0.12;
            ballState.vz += (bdz / bdist) * 0.12;
            kid.waitTime = 400;
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
            const wc = time * 6;
            kid.leg1.rotation.x = Math.sin(wc) * 0.5;
            kid.leg2.rotation.x = Math.sin(wc + Math.PI) * 0.5;
            kid.arm1.rotation.x = Math.sin(wc + Math.PI) * 0.4;
            kid.arm2.rotation.x = Math.sin(wc) * 0.4;
          }
        }
        kid.mesh.position.x = Math.max(schoolBounds.cx - 12, Math.min(schoolBounds.cx + 12, kid.mesh.position.x));
        kid.mesh.position.z = Math.max(fieldZ - 8, Math.min(fieldZ + 8, kid.mesh.position.z));
      });
      ballState.x += ballState.vx;
      ballState.z += ballState.vz;
      ballState.vx *= 0.95;
      ballState.vz *= 0.95;
      ballState.x = Math.max(schoolBounds.cx - 12, Math.min(schoolBounds.cx + 12, ballState.x));
      ballState.z = Math.max(fieldZ - 8, Math.min(fieldZ + 8, ballState.z));
      ball.position.set(ballState.x, 0.25 + Math.abs(Math.sin(time * 5)) * 0.05, ballState.z);
      ball.rotation.x += ballState.vz * 2;
      ball.rotation.z -= ballState.vx * 2;
    }

    // ==================== FAMILY ====================
    function updateFamily(dt: number) {
      const s = settingsRef.current;
      Object.values(family).forEach((member: any) => { member.mesh.visible = s.showFamily; });
      if (!s.showFamily) return;
      const time = Date.now() * 0.001;
      family.dad.arm2.rotation.x = Math.sin(time * 2) * 0.4 - 0.5;
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

    // ==================== MAIN LOOP ====================
    let lastTime = 0;
    let animId: number;
    let frameCount = 0;
    let lastFpsTime = 0;

    function animate(time: number) {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(time - lastTime, 50);
      lastTime = time;

      frameCount++;
      if (time - lastFpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = time;
      }

      controls.autoRotate = settingsRef.current.autoRotate;

      updateTime(dt);
      updateCars(dt);
      updatePedestrians(dt);
      updateSchoolKids(dt);
      updateFamily(dt);
      controls.update();
      renderer.render(scene, camera);
    }
    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    setTimeout(() => setLoading(false), 800);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="veridia-wrapper">
      {/* ─── Love Message Overlay ─── */}
      <div className="love-message">
        <span className="love-heart">💖</span>
        <span className="love-text">{loveMessage}</span>
        <span className="love-heart">💖</span>
      </div>

      {/* ─── Settings Toggle Button ─── */}
      <button 
        className="settings-toggle"
        onClick={() => setShowSettings(!showSettings)}
        title="City Settings"
      >
        ⚙️
      </button>

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
              <label>Time Speed</label>
              <div className="speed-buttons">
                {[0.5, 1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    className={timeSpeed === speed ? "active" : ""}
                    onClick={() => setTimeSpeed(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <label>Pause Time</label>
              <button 
                className={`toggle-btn ${paused ? "active" : ""}`}
                onClick={() => setPaused(!paused)}
              >
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
                <button
                  className={`toggle-btn ${item.state ? "active" : ""}`}
                  onClick={() => item.set(!item.state)}
                >
                  {item.state ? "✓ On" : "✕ Off"}
                </button>
              </div>
            ))}
          </div>

          <div className="settings-section">
            <h4>🎨 Quality</h4>
            <div className="setting-row">
              <label>Shadow Quality</label>
              <select 
                value={shadowQuality} 
                onChange={(e) => setShadowQuality(e.target.value as any)}
              >
                <option value="low">Low (Fastest)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Prettiest)</option>
              </select>
            </div>
            <div className="setting-row">
              <label>Fog Density</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={fogDensity}
                onChange={(e) => setFogDensity(parseFloat(e.target.value))}
              />
              <span>{fogDensity.toFixed(1)}x</span>
            </div>
            <div className="setting-row">
              <label>Camera Height</label>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={cameraHeight}
                onChange={(e) => setCameraHeight(parseInt(e.target.value))}
              />
              <span>{cameraHeight}m</span>
            </div>
          </div>

          <div className="settings-section">
            <h4>💌 Love Note</h4>
            <input
              type="text"
              value={loveMessage}
              onChange={(e) => setLoveMessage(e.target.value)}
              placeholder="Write a message for her..."
              className="love-input"
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="city-loading">
          <h2>Building Veridia...</h2>
          <div className="loading-bar"><div className="loading-progress" /></div>
        </div>
      )}

      <div className="ui-time">
        <div className="clock" ref={clockRef}>08:00</div>
        <div className="date" ref={dateRef}>Saturday, May 16</div>
      </div>

      <div className="ui-hint">
        Left drag = rotate • Right drag = pan • Scroll = zoom
      </div>

      <div className="fps-counter">{fps} FPS</div>

      <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)} title="Settings">
        ⚙️
      </button>

      {showSettings && (
        <div className="settings-panel">
          <h3>🌆 Veridia Settings</h3>

          <div className="setting-group">
            <label>⏱️ Time Speed</label>
            <input type="range" min="0" max="5" step="0.1" value={settings.timeSpeed}
              onChange={(e) => updateSetting("timeSpeed", parseFloat(e.target.value))} />
            <span>{settings.timeSpeed}x</span>
          </div>

          <div className="setting-group">
            <label>🚗 Car Speed</label>
            <input type="range" min="0" max="3" step="0.1" value={settings.carSpeed}
              onChange={(e) => updateSetting("carSpeed", parseFloat(e.target.value))} />
            <span>{settings.carSpeed}x</span>
          </div>

          <div className="setting-group">
            <label>🚶 Pedestrian Speed</label>
            <input type="range" min="0" max="3" step="0.1" value={settings.pedestrianSpeed}
              onChange={(e) => updateSetting("pedestrianSpeed", parseFloat(e.target.value))} />
            <span>{settings.pedestrianSpeed}x</span>
          </div>

          <div className="setting-row">
            <label><input type="checkbox" checked={settings.showCars}
              onChange={(e) => updateSetting("showCars", e.target.checked)} /> 🚗 Cars</label>
            <label><input type="checkbox" checked={settings.showPedestrians}
              onChange={(e) => updateSetting("showPedestrians", e.target.checked)} /> 🚶 People</label>
          </div>

          <div className="setting-row">
            <label><input type="checkbox" checked={settings.showFamily}
              onChange={(e) => updateSetting("showFamily", e.target.checked)} /> 👨‍👩‍👧‍👦 Family</label>
            <label><input type="checkbox" checked={settings.showStreetLights}
              onChange={(e) => updateSetting("showStreetLights", e.target.checked)} /> 💡 Street Lights</label>
          </div>

          <div className="setting-row">
            <label><input type="checkbox" checked={settings.dayNightCycle}
              onChange={(e) => updateSetting("dayNightCycle", e.target.checked)} /> 🌅 Day/Night</label>
            <label><input type="checkbox" checked={settings.shadows}
              onChange={(e) => updateSetting("shadows", e.target.checked)} /> 🌑 Shadows</label>
          </div>

          <div className="setting-row">
            <label><input type="checkbox" checked={settings.fog}
              onChange={(e) => updateSetting("fog", e.target.checked)} /> 🌫️ Fog</label>
            <label><input type="checkbox" checked={settings.autoRotate}
              onChange={(e) => updateSetting("autoRotate", e.target.checked)} /> 🔄 Auto Rotate</label>
          </div>

          <p className="setting-hint">
            Made with 💕 for Dal — Your forever home in Veridia
          </p>
        </div>
      )}

      <div ref={mountRef} className="city-canvas" />

      <style jsx>{`
        .veridia-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #0a0a0f;
        }

        /* ─── Love Message ─── */
        .love-message {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          background: linear-gradient(135deg, rgba(255,100,150,0.15), rgba(200,100,255,0.1));
          border-radius: 50px;
          border: 1px solid rgba(255,150,200,0.2);
          backdrop-filter: blur(12px);
          animation: lovePulse 3s ease-in-out infinite;
          pointer-events: none;
        }
        .love-heart {
          font-size: 1.4rem;
          animation: heartBeat 1.5s ease-in-out infinite;
        }
        .love-text {
          font-size: 1rem;
          font-weight: 600;
          color: #ffd1dc;
          text-shadow: 0 2px 10px rgba(255,100,150,0.3);
          letter-spacing: 0.02em;
        }
        @keyframes lovePulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,100,150,0.1); }
          50% { box-shadow: 0 0 40px rgba(255,100,150,0.25); }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* ─── Settings Toggle ─── */
        .settings-toggle {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          font-size: 1.3rem;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .settings-toggle:hover {
          transform: translateX(-50%) scale(1.1);
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
          box-shadow: 0 0 20px rgba(255,255,255,0.1);
        }

        /* ─── Settings Panel ─── */
        .settings-panel {
          position: absolute;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 25;
          width: 320px;
          max-height: 70vh;
          overflow-y: auto;
          background: linear-gradient(145deg, rgba(20,20,35,0.95), rgba(10,10,20,0.98));
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .settings-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #feca57;
          font-weight: 700;
        }
        .settings-header button {
          background: none;
          border: none;
          color: #8a8aa8;
          font-size: 1.2rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .settings-header button:hover {
          color: #fff;
        }

        .settings-section {
          margin-bottom: 16px;
        }
        .settings-section h4 {
          margin: 0 0 10px 0;
          font-size: 0.85rem;
          color: #a0a0b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .setting-row label {
          font-size: 0.9rem;
          color: #d0d0e0;
        }

        .speed-buttons {
          display: flex;
          gap: 6px;
        }
        .speed-buttons button {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #a0a0b8;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .speed-buttons button:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }
        .speed-buttons button.active {
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          color: #1a1a2e;
          border-color: transparent;
          font-weight: 700;
        }

        .toggle-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #8a8aa8;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn:hover {
          background: rgba(255,255,255,0.12);
        }
        .toggle-btn.active {
          background: linear-gradient(135deg, rgba(100,200,100,0.3), rgba(100,200,100,0.15));
          color: #90ee90;
          border-color: rgba(100,200,100,0.3);
        }

        .setting-row select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #d0d0e0;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .setting-row select option {
          background: #1a1a2e;
          color: #d0d0e0;
        }

        .setting-row input[type="range"] {
          width: 100px;
          -webkit-appearance: none;
          height: 5px;
          border-radius: 3px;
          background: rgba(255,255,255,0.08);
          outline: none;
        }
        .setting-row input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #feca57;
          cursor: pointer;
        }
        .setting-row span {
          font-size: 0.8rem;
          color: #6e6e8a;
          min-width: 30px;
          text-align: right;
        }

        .love-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,150,200,0.2);
          border-radius: 12px;
          padding: 10px 14px;
          color: #ffd1dc;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
        }
        .love-input:focus {
          border-color: rgba(255,150,200,0.4);
          box-shadow: 0 0 15px rgba(255,150,200,0.1);
        }
        .love-input::placeholder {
          color: rgba(255,150,200,0.4);
        }
        .city-canvas {
          width: 100%;
          height: 100%;
        }
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
          transition: opacity 1s;
        }
        .city-loading h2 {
          font-size: 24px;
          margin-bottom: 16px;
          font-weight: 300;
        }
        .loading-bar {
          width: 220px;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        .loading-progress {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          width: 100%;
          animation: loadPulse 1.5s ease-in-out infinite;
        }
        @keyframes loadPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ui-time {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
          color: white;
          text-align: right;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
          pointer-events: none;
          font-family: "Segoe UI", sans-serif;
        }
        .ui-time .clock {
          font-size: 26px;
          font-weight: 300;
          font-variant-numeric: tabular-nums;
        }
        .ui-time .date {
          font-size: 12px;
          opacity: 0.7;
        }
        .ui-hint {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          color: white;
          font-size: 12px;
          opacity: 0.5;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
          pointer-events: none;
          text-align: center;
          font-family: "Segoe UI", sans-serif;
        }
        .fps-counter {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          font-family: monospace;
          pointer-events: none;
        }
        .settings-toggle {
          position: absolute;
          top: 20px;
          right: 50%;
          transform: translateX(50%);
          z-index: 20;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
          font-size: 1.3rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .settings-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(50%) scale(1.1);
        }
        .settings-panel {
          position: absolute;
          top: 70px;
          right: 50%;
          transform: translateX(50%);
          z-index: 20;
          width: 320px;
          max-height: 70vh;
          overflow-y: auto;
          background: rgba(10, 10, 25, 0.92);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          color: #fff;
          font-family: "Segoe UI", sans-serif;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(50%) translateY(0); }
        }
        .settings-panel h3 {
          margin: 0 0 20px 0;
          font-size: 1.1rem;
          text-align: center;
          background: linear-gradient(90deg, #ff6b6b, #feca57);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .setting-group {
          margin-bottom: 16px;
        }
        .setting-group label {
          display: block;
          font-size: 0.85rem;
          color: #a0a0b8;
          margin-bottom: 6px;
        }
        .setting-group input[type="range"] {
          width: 100%;
          -webkit-appearance: none;
          height: 5px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
        }
        .setting-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          cursor: pointer;
        }
        .setting-group span {
          display: inline-block;
          margin-top: 4px;
          font-size: 0.8rem;
          color: #feca57;
          font-variant-numeric: tabular-nums;
        }
        .setting-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }
        .setting-row label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #c0c0d8;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          transition: background 0.2s;
        }
        .setting-row label:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .setting-row input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #ff6b6b;
        }
        .setting-hint {
          text-align: center;
          font-size: 0.78rem;
          color: #6e6e8a;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
