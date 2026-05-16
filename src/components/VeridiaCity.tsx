"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function VeridiaCity() {
  const mountRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ==================== CONSTANTS ====================
    const ROAD_WIDTH = 8;
    const LANE_OFFSET = 1.8;
    const BLOCK_SIZE = 32;
    const ROAD_CENTERS = [-60, -20, 20, 60];
    const CITY_MIN = -80;
    const CITY_MAX = 80;
    const HOUSE_W = 10;
    const HOUSE_D = 8;
    const HOUSE_H = 3.5;
    const DAY_SECONDS = 90;

    // ==================== SCENE ====================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 120, 350);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(50, 45, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    // ==================== LIGHTS ====================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.3);
    sunLight.position.set(60, 90, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 300;
    const S = 100;
    sunLight.shadow.camera.left = -S;
    sunLight.shadow.camera.right = S;
    sunLight.shadow.camera.top = S;
    sunLight.shadow.camera.bottom = -S;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // ==================== MATERIALS ====================
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

    // ==================== HELPERS ====================
    function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, cast = true, receive = true) {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, mat);
      m.position.set(x, y, z);
      m.castShadow = cast;
      m.receiveShadow = receive;
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
      return m;
    }

    // ==================== GROUND ====================
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), M.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // ==================== ROAD SYSTEM ====================
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

    // ==================== BLOCK DEFINITIONS ====================
    function getBlockBounds(col: number, row: number) {
      const left = ROAD_CENTERS[col] + ROAD_WIDTH / 2;
      const right = ROAD_CENTERS[col + 1] - ROAD_WIDTH / 2;
      const bottom = ROAD_CENTERS[row] + ROAD_WIDTH / 2;
      const top = ROAD_CENTERS[row + 1] - ROAD_WIDTH / 2;
      return { left, right, bottom, top, cx: (left + right) / 2, cz: (bottom + top) / 2 };
    }

    // ==================== HOUSE CREATOR ====================
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

    // ==================== TREE CREATOR ====================
    function createTree(x: number, z: number, parent: THREE.Object3D = scene) {
      const g = new THREE.Group();
      g.add(cylinder(0.15, 0.2, 1.8, 6, M.treeTrunk, 0, 0.9, 0));
      const l1 = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 6), M.treeLeaves);
      l1.position.set(0, 2.4, 0);
      l1.castShadow = true;
      g.add(l1);
      const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), M.treeLeaves2);
      l2.position.set(0.3, 3.0, 0.2);
      l2.castShadow = true;
      g.add(l2);
      g.position.set(x, 0, z);
      const s = 0.7 + Math.random() * 0.4;
      g.scale.set(s, s, s);
      parent.add(g);
    }

    // ==================== PLACE HOUSES IN BLOCKS ====================
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

    // ==================== CENTRAL PARK ====================
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

    // ==================== SCHOOL ====================
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
      gg.add(
        box(
          7.2,
          2.2,
          0.02,
          new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }),
          0,
          1.1,
          0
        )
      );
      gg.position.set(gx, 0, gz);
      scene.add(gg);
    }
    createGoal(schoolBounds.cx, fieldZ - 8);
    createGoal(schoolBounds.cx, fieldZ + 8);

    createTree(schoolBounds.cx - 14, schoolBounds.cz + 2);
    createTree(schoolBounds.cx + 14, schoolBounds.cz + 2);
    createTree(schoolBounds.cx - 14, schoolBounds.cz - 8);
    createTree(schoolBounds.cx + 14, schoolBounds.cz - 8);

    // ==================== MANSION ====================
    const mansBounds = getBlockBounds(2, 2);
    const mx = mansBounds.cx;
    const mz = mansBounds.cz;
    const mg = new THREE.Group();

    mg.add(box(14, 4, 10, M.wallBeige, 0, 2, 0));
    mg.add(box(14, 3.5, 10, M.wallBeige, 0, 5.75, 0));
    mg.add(box(15, 0.3, 11, M.roofDark, 0, 7.7, 0));

    for (let i = -2; i <= 2; i++) {
      mg.add(box(1.2, 1.8, 0.1, M.window, i * 2.5, 2.5, 5.05));
      mg.add(box(1.2, 1.8, 0.1, M.window, i * 2.5, 2.5, -5.05));
      mg.add(box(1.2, 1.5, 0.1, M.window, i * 2.5, 5.5, 5.05));
    }

    mg.add(box(1.6, 2.6, 0.12, M.door, 0, 1.3, 5.06));
    mg.add(box(1.8, 0.1, 0.25, M.gold, 0, 2.65, 5.08));
    mg.add(cylinder(0.05, 0.05, 0.12, 8, M.gold, 0.5, 1.3, 5.12));

    mg.add(box(10, 3.2, 7, M.wallWhite, 11, 1.6, 1));
    mg.add(box(10, 0.25, 7, M.roofDark, 11, 3.225, 1));
    mg.add(box(5.5, 2.4, 0.12, M.metal, 11, 1.2, 4.56));
    mg.add(box(6, 0.12, 10, M.sidewalk, 11, 0.06, 8));

    mg.add(box(7, 0.3, 4.5, M.metal, -10, 0.15, 7));
    mg.add(box(6.4, 0.25, 3.9, M.water, -10, 0.2, 7));

    const fLeft = mansBounds.left + 1,
      fRight = mansBounds.right - 1;
    const fBot = mansBounds.bottom + 1,
      fTop = mansBounds.top - 1;
    for (let fx = fLeft; fx <= fRight; fx += 3) {
      mg.add(cylinder(0.04, 0.04, 1.8, 4, M.fence, fx, 0.9, fBot));
      mg.add(cylinder(0.04, 0.04, 1.8, 4, M.fence, fx, 0.9, fTop));
    }
    for (let fz = fBot; fz <= fTop; fz += 3) {
      mg.add(cylinder(0.04, 0.04, 1.8, 4, M.fence, fLeft, 0.9, fz));
      mg.add(cylinder(0.04, 0.04, 1.8, 4, M.fence, fRight, 0.9, fz));
    }
    mg.add(box(fRight - fLeft, 0.04, 0.04, M.fence, (fLeft + fRight) / 2, 1.5, fBot));
    mg.add(box(fRight - fLeft, 0.04, 0.04, M.fence, (fLeft + fRight) / 2, 1.5, fTop));
    mg.add(box(0.04, 0.04, fTop - fBot, M.fence, fLeft, 1.5, (fBot + fTop) / 2));
    mg.add(box(0.04, 0.04, fTop - fBot, M.fence, fRight, 1.5, (fBot + fTop) / 2));

    createTree(-8, -10, mg);
    createTree(8, -10, mg);
    createTree(-12, 4, mg);
    createTree(16, -6, mg);
    createTree(16, 10, mg);

    mg.position.set(mx, 0, mz);
    scene.add(mg);

    // ==================== LUXURY CARS ====================
    function createLuxuryCar(bodyMat: THREE.Material, x: number, z: number, rotY: number) {
      const g = new THREE.Group();
      g.add(box(2.0, 0.75, 4.8, bodyMat, 0, 0.75, 0));
      g.add(box(2.05, 0.35, 4.9, bodyMat, 0, 0.35, 0));
      g.add(box(1.7, 0.6, 2.4, M.glass, 0, 1.45, -0.2));
      g.add(box(1.75, 0.06, 2.45, bodyMat, 0, 1.77, -0.2));
      const wheelPos = [
        [-1.0, 0.32, 1.5],
        [1.0, 0.32, 1.5],
        [-1.0, 0.32, -1.5],
        [1.0, 0.32, -1.5],
      ];
      wheelPos.forEach((p) => {
        const wg = new THREE.Group();
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.28, 16), M.wheel);
        tire.rotation.z = Math.PI / 2;
        wg.add(tire);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.29, 12), M.rim);
        rim.rotation.z = Math.PI / 2;
        wg.add(rim);
        wg.position.set(p[0], p[1], p[2]);
        g.add(wg);
      });
      const hlGeo = new THREE.BoxGeometry(0.35, 0.15, 0.06);
      const hl1 = new THREE.Mesh(hlGeo, M.headlight);
      hl1.position.set(-0.6, 0.65, 2.42);
      g.add(hl1);
      const hl2 = new THREE.Mesh(hlGeo, M.headlight);
      hl2.position.set(0.6, 0.65, 2.42);
      g.add(hl2);
      const tl1 = new THREE.Mesh(hlGeo, M.taillight);
      tl1.position.set(-0.6, 0.65, -2.42);
      g.add(tl1);
      const tl2 = new THREE.Mesh(hlGeo, M.taillight);
      tl2.position.set(0.6, 0.65, -2.42);
      g.add(tl2);
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      scene.add(g);
      return g;
    }

    createLuxuryCar(M.carGold, mx + 11, mz + 6, 0.1);
    createLuxuryCar(M.carBlack, mx + 11, mz + 10, -0.15);
    createLuxuryCar(M.carRed, mx + 8, mz + 14, 0.05);

    // ==================== FAMILY ====================
    function createPerson(opts: any): any {
      const g = new THREE.Group();
      const { height = 1.75, shirtMat, pantsMat, hairMat, isFemale = false, isChild = false } = opts;
      const scale = isChild ? 0.55 : 1.0;
      const h = height * scale;

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 12, 12), M.skin);
      head.position.y = h - 0.12;
      head.castShadow = true;
      g.add(head);

      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      hair.position.y = h - 0.08;
      g.add(hair);

      const bodyW = isFemale ? 0.32 * scale : 0.38 * scale;
      const bodyH = isFemale ? 0.5 * scale : 0.55 * scale;
      const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, 0.22 * scale), shirtMat);
      body.position.y = h - 0.45 * scale - 0.12;
      body.castShadow = true;
      g.add(body);

      const armGeo = new THREE.BoxGeometry(0.1 * scale, 0.45 * scale, 0.1 * scale);
      const arm1 = new THREE.Mesh(armGeo, shirtMat);
      arm1.position.set(-(bodyW / 2 + 0.06), h - 0.45 * scale - 0.12, 0);
      g.add(arm1);
      const arm2 = new THREE.Mesh(armGeo, shirtMat);
      arm2.position.set(bodyW / 2 + 0.06, h - 0.45 * scale - 0.12, 0);
      g.add(arm2);

      const legGeo = new THREE.BoxGeometry(0.13 * scale, 0.55 * scale, 0.13 * scale);
      const leg1 = new THREE.Mesh(legGeo, pantsMat);
      leg1.position.set(-0.1 * scale, 0.275 * scale, 0);
      g.add(leg1);
      const leg2 = new THREE.Mesh(legGeo, pantsMat);
      leg2.position.set(0.1 * scale, 0.275 * scale, 0);
      g.add(leg2);

      const shoeGeo = new THREE.BoxGeometry(0.14 * scale, 0.08 * scale, 0.2 * scale);
      const shoe1 = new THREE.Mesh(shoeGeo, M.shoes);
      shoe1.position.set(-0.1 * scale, 0.04, 0.03);
      g.add(shoe1);
      const shoe2 = new THREE.Mesh(shoeGeo, M.shoes);
      shoe2.position.set(0.1 * scale, 0.04, 0.03);
      g.add(shoe2);

      if (isFemale && !isChild) {
        const dress = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.28 * scale, 0.4 * scale, 8), M.dress);
        dress.position.y = h - 0.75 * scale;
        g.add(dress);
      }

      scene.add(g);
      return { mesh: g, arm1, arm2, leg1, leg2, height: h, scale, isChild } as any;
    }

    const family: Record<string, any> = {
      dad: createPerson({ height: 1.82, shirtMat: M.shirtBlue, pantsMat: M.pantsBlue, hairMat: M.hairBlack }),
      mom: createPerson({ height: 1.68, shirtMat: M.shirtWhite, pantsMat: M.pantsKhaki, hairMat: M.hairBrown, isFemale: true }),
      son: createPerson({ height: 1.35, shirtMat: M.shirtGreen, pantsMat: M.pantsGray, hairMat: M.hairBlonde, isChild: true }),
      daughter: createPerson({ height: 1.25, shirtMat: M.shirtPink, pantsMat: M.pantsGray, hairMat: M.hairBrown, isChild: true, isFemale: true }),
    };

    family.dad.mesh.position.set(mx - 1, 0, mz + 5.5);
    family.dad.mesh.rotation.y = Math.PI;
    family.mom.mesh.position.set(mx + 1, 0, mz + 5.5);
    family.mom.mesh.rotation.y = Math.PI;
    family.son.mesh.position.set(mx - 2.5, 0, mz + 6.5);
    family.son.mesh.rotation.y = Math.PI * 0.85;
    family.daughter.mesh.position.set(mx + 2.5, 0, mz + 6.5);
    family.daughter.mesh.rotation.y = Math.PI * 1.15;

    // ==================== STREET LIGHTS ====================
    const streetLights: any[] = [];
    ROAD_CENTERS.forEach((xc) => {
      ROAD_CENTERS.forEach((zc) => {
        const offsets = [
          [-4, -4],
          [4, -4],
          [-4, 4],
          [4, 4],
        ];
        offsets.forEach(([ox, oz]) => {
          const lx = xc + ox;
          const lz = zc + oz;
          const pole = cylinder(0.08, 0.1, 5, 8, M.metal, lx, 2.5, lz);
          scene.add(pole);
          const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xffeebb, emissive: 0xffaa55, emissiveIntensity: 0 })
          );
          bulb.position.set(lx, 5.2, lz);
          scene.add(bulb);
          const light = new THREE.PointLight(0xffaa55, 0, 15);
          light.position.set(lx, 5, lz);
          scene.add(light);
          streetLights.push({ bulb, light });
        });
      });
    });

    // ==================== CAR SYSTEM ====================
    const cars: any[] = [];
    const carColors = [M.carRed, M.carBlue, M.carBlack, M.carWhite, M.carSilver, M.carGold];

    function createCar(bodyMat: THREE.Material) {
      const g = new THREE.Group();
      g.add(box(1.8, 0.85, 4.2, bodyMat, 0, 0.85, 0));
      g.add(box(1.85, 0.4, 4.3, bodyMat, 0, 0.4, 0));
      g.add(box(1.55, 0.65, 2.3, M.glass, 0, 1.55, -0.2));
      g.add(box(1.6, 0.06, 2.35, bodyMat, 0, 1.88, -0.2));

      const wheels: any[] = [];
      const wheelPos = [
        [-0.9, 0.32, 1.3],
        [0.9, 0.32, 1.3],
        [-0.9, 0.32, -1.3],
        [0.9, 0.32, -1.3],
      ];
      wheelPos.forEach((p) => {
        const wg = new THREE.Group();
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 16), M.wheel);
        tire.rotation.z = Math.PI / 2;
        wg.add(tire);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.25, 12), M.rim);
        rim.rotation.z = Math.PI / 2;
        wg.add(rim);
        wg.position.set(p[0], p[1], p[2]);
        g.add(wg);
        wheels.push(wg);
      });

      const hlGeo = new THREE.BoxGeometry(0.38, 0.16, 0.06);
      const hl1 = new THREE.Mesh(hlGeo, M.headlight);
      hl1.position.set(-0.55, 0.72, 2.12);
      g.add(hl1);
      const hl2 = new THREE.Mesh(hlGeo, M.headlight);
      hl2.position.set(0.55, 0.72, 2.12);
      g.add(hl2);
      const tl1 = new THREE.Mesh(hlGeo, M.taillight);
      tl1.position.set(-0.55, 0.72, -2.12);
      g.add(tl1);
      const tl2 = new THREE.Mesh(hlGeo, M.taillight);
      tl2.position.set(0.55, 0.72, -2.12);
      g.add(tl2);
      g.add(box(0.7, 0.2, 0.02, M.metal, 0, 0.42, -2.14));

      scene.add(g);
      return { mesh: g, wheels };
    }

    const lanes: any[] = [];
    ROAD_CENTERS.forEach((zc, i) => {
      lanes.push({ id: `h${i}r`, type: "h", center: zc, offset: LANE_OFFSET, dir: 1, z: zc + LANE_OFFSET });
      lanes.push({ id: `h${i}l`, type: "h", center: zc, offset: -LANE_OFFSET, dir: -1, z: zc - LANE_OFFSET });
    });
    ROAD_CENTERS.forEach((xc, i) => {
      lanes.push({ id: `v${i}r`, type: "v", center: xc, offset: LANE_OFFSET, dir: -1, x: xc + LANE_OFFSET });
      lanes.push({ id: `v${i}l`, type: "v", center: xc, offset: -LANE_OFFSET, dir: 1, x: xc - LANE_OFFSET });
    });

    lanes.forEach((lane, li) => {
      const color = carColors[li % carColors.length];
      for (let i = 0; i < 2; i++) {
        const carData = createCar(color);
        const car = {
          mesh: carData.mesh,
          wheels: carData.wheels,
          lane: lane,
          pos: CITY_MIN + 20 + i * 70,
          speed: 0.08 + (li % 3) * 0.02,
          maxSpeed: 0.12 + (li % 3) * 0.02,
          state: "driving",
          turnData: null,
          id: cars.length,
        };

        if (lane.type === "h") {
          car.mesh.position.set(car.pos, 0, lane.z);
          car.mesh.rotation.y = lane.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
        } else {
          car.mesh.position.set(lane.x, 0, car.pos);
          car.mesh.rotation.y = lane.dir > 0 ? 0 : Math.PI;
        }

        cars.push(car);
      }
    });

    function getTurnCurve(ix: number, iz: number, fromLane: any, turn: string) {
      const LO = LANE_OFFSET;
      const D = 10;
      const fromDir = fromLane.dir;
      const fromType = fromLane.type;

      let startX = 0,
        startZ = 0,
        startRot = 0,
        endX = 0,
        endZ = 0,
        endRot = 0;

      if (fromType === "h") {
        const z = iz + fromLane.offset;
        if (fromDir > 0) {
          startX = ix - D;
          startZ = z;
          startRot = -Math.PI / 2;
        } else {
          startX = ix + D;
          startZ = z;
          startRot = Math.PI / 2;
        }
      } else {
        const x = ix + fromLane.offset;
        if (fromDir > 0) {
          startX = x;
          startZ = iz - D;
          startRot = 0;
        } else {
          startX = x;
          startZ = iz + D;
          startRot = Math.PI;
        }
      }

      if (turn === "straight") {
        if (fromType === "h" && fromDir > 0) {
          endX = ix + D;
          endZ = startZ;
          endRot = -Math.PI / 2;
        } else if (fromType === "h" && fromDir < 0) {
          endX = ix - D;
          endZ = startZ;
          endRot = Math.PI / 2;
        } else if (fromType === "v" && fromDir > 0) {
          endX = startX;
          endZ = iz + D;
          endRot = 0;
        } else {
          endX = startX;
          endZ = iz - D;
          endRot = Math.PI;
        }
      } else if (turn === "right") {
        if (fromType === "h" && fromDir > 0) {
          endX = ix - LO;
          endZ = iz + D;
          endRot = 0;
        } else if (fromType === "h" && fromDir < 0) {
          endX = ix + LO;
          endZ = iz - D;
          endRot = Math.PI;
        } else if (fromType === "v" && fromDir > 0) {
          endX = ix - D;
          endZ = iz + LO;
          endRot = Math.PI / 2;
        } else {
          endX = ix + D;
          endZ = iz - LO;
          endRot = -Math.PI / 2;
        }
      } else if (turn === "left") {
        if (fromType === "h" && fromDir > 0) {
          endX = ix + LO;
          endZ = iz - D;
          endRot = Math.PI;
        } else if (fromType === "h" && fromDir < 0) {
          endX = ix - LO;
          endZ = iz + D;
          endRot = 0;
        } else if (fromType === "v" && fromDir > 0) {
          endX = ix + D;
          endZ = iz - LO;
          endRot = -Math.PI / 2;
        } else {
          endX = ix - D;
          endZ = iz + LO;
          endRot = Math.PI / 2;
        }
      }

      let cx = 0,
        cz = 0;
      if (turn === "straight") {
        cx = (startX + endX) / 2;
        cz = (startZ + endZ) / 2;
      } else {
        const dx = Math.sign(endX - ix);
        const dz = Math.sign(endZ - iz);
        cx = ix + dx * LO;
        cz = iz + dz * LO;
      }

      return { startX, startZ, startRot, endX, endZ, endRot, cx, cz };
    }

    // ==================== PEDESTRIANS ====================
    const pedestrians: any[] = [];
    const pedShirts = [M.shirtRed, M.shirtBlue, M.shirtGreen, M.shirtYellow, M.shirtPurple, M.shirtWhite];
    const pedPants = [M.pantsBlue, M.pantsBlack, M.pantsGray, M.pantsKhaki];

    for (let i = 0; i < 24; i++) {
      const ped = createPerson({
        height: 1.6 + (i % 3) * 0.1,
        shirtMat: pedShirts[i % pedShirts.length],
        pantsMat: pedPants[i % pedPants.length],
        hairMat: i % 2 === 0 ? M.hairBlack : M.hairBrown,
      });
      const roadIdx = i % ROAD_CENTERS.length;
      const rc = ROAD_CENTERS[roadIdx];
      const side = i % 2 === 0 ? 1 : -1;
      if (i % 4 < 2) {
        ped.mesh.position.set(-60 + ((i * 8) % 120), 0, rc + side * (ROAD_WIDTH / 2 + 1));
      } else {
        ped.mesh.position.set(rc + side * (ROAD_WIDTH / 2 + 1), 0, -60 + ((i * 7) % 120));
      }
      ped.targetX = ped.mesh.position.x;
      ped.targetZ = ped.mesh.position.z;
      ped.speed = 0.012 + (i % 4) * 0.003;
      ped.waitTime = i * 200;
      pedestrians.push(ped);
    }

    // ==================== SCHOOL KIDS ====================
    const schoolKids: any[] = [];
    const kidColors = [M.shirtRed, M.shirtBlue, M.shirtYellow, M.shirtGreen, M.shirtPurple];
    for (let i = 0; i < 10; i++) {
      const kid = createPerson({
        height: 1.15 + (i % 3) * 0.12,
        shirtMat: kidColors[i % kidColors.length],
        pantsMat: M.pantsGray,
        hairMat: i % 2 === 0 ? M.hairBrown : M.hairBlonde,
        isChild: true,
      });
      kid.mesh.position.set(schoolBounds.cx + (i % 5 - 2) * 4, 0, fieldZ + (Math.floor(i / 5) - 0.5) * 6);
      kid.mesh.rotation.y = Math.random() * Math.PI * 2;
      kid.team = i < 5 ? "A" : "B";
      kid.targetX = kid.mesh.position.x;
      kid.targetZ = kid.mesh.position.z;
      kid.speed = 0.025 + (i % 3) * 0.008;
      kid.waitTime = i * 300;
      schoolKids.push(kid);
    }

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
      timeOfDay += (dt / 1000) * (24 / DAY_SECONDS);
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
      if (timeOfDay < 5 || timeOfDay > 20) {
        skyColor = 0x0a0a1a;
        sunInt = 0;
        ambInt = 0.12;
      } else if (timeOfDay < 7) {
        const t = (timeOfDay - 5) / 2;
        skyColor = new THREE.Color(0x0a0a1a).lerp(new THREE.Color(0xffaa77), t);
        sunInt = t * 1.3;
        ambInt = 0.12 + t * 0.35;
      } else if (timeOfDay < 17) {
        skyColor = 0x87ceeb;
        sunInt = 1.3;
        ambInt = 0.5;
      } else if (timeOfDay < 20) {
        const t = (timeOfDay - 17) / 3;
        skyColor = new THREE.Color(0x87ceeb).lerp(new THREE.Color(0x0a0a1a), t);
        sunInt = 1.3 * (1 - t);
        ambInt = 0.5 * (1 - t) + 0.12 * t;
      } else {
        skyColor = 0x0a0a1a;
        sunInt = 0;
        ambInt = 0.12;
      }
      scene.background = new THREE.Color(skyColor);
      scene.fog = new THREE.Fog(skyColor instanceof THREE.Color ? skyColor.getHex() : skyColor, 120, 350);
      sunLight.intensity = sunInt;
      ambientLight.intensity = ambInt;

      const angle = ((timeOfDay - 6) / 12) * Math.PI;
      sunLight.position.set(Math.cos(angle) * 100, Math.sin(angle) * 70, 40);

      const isNight = timeOfDay < 6 || timeOfDay > 19;
      streetLights.forEach((sl) => {
        sl.light.intensity = isNight ? 1.5 : 0;
        sl.bulb.material.emissiveIntensity = isNight ? 1 : 0;
      });
    }

    // ==================== CAR UPDATE ====================
    function updateCars(dt: number) {
      const dtSec = dt / 1000;

      cars.forEach((car) => {
        if (car.state === "driving") {
          let nearestIx: any = null,
            nearestDist = Infinity;
          for (const ix of intersections) {
            let dist: number;
            if (car.lane.type === "h") {
              dist = car.lane.dir > 0 ? ix.x - car.pos : car.pos - ix.x;
            } else {
              dist = car.lane.dir > 0 ? ix.z - car.pos : car.pos - ix.z;
            }
            if (dist > 2 && dist < nearestDist) {
              nearestDist = dist;
              nearestIx = ix;
            }
          }

          let targetSpeed = car.maxSpeed;

          for (const other of cars) {
            if (other === car) continue;
            if (other.lane.id !== car.lane.id) continue;
            let dist: number;
            if (car.lane.type === "h") {
              dist = car.lane.dir > 0 ? other.mesh.position.x - car.mesh.position.x : car.mesh.position.x - other.mesh.position.x;
            } else {
              dist = car.lane.dir > 0 ? other.mesh.position.z - car.mesh.position.z : car.mesh.position.z - other.mesh.position.z;
            }
            if (dist > 0 && dist < 12) {
              targetSpeed = Math.min(targetSpeed, other.speed * 0.8);
            }
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
            } else {
              if (nearestDist < 8) targetSpeed = Math.min(targetSpeed, 0.04);
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
            let bestLane = car.lane;
            let bestDist = Infinity;
            lanes.forEach((l) => {
              let dist: number;
              if (l.type === "h") {
                dist = Math.abs(car.mesh.position.z - l.z);
              } else {
                dist = Math.abs(car.mesh.position.x - l.x);
              }
              if (dist < bestDist) {
                bestDist = dist;
                bestLane = l;
              }
            });
            car.lane = bestLane;
            if (car.lane.type === "h") {
              car.pos = car.mesh.position.x;
            } else {
              car.pos = car.mesh.position.z;
            }
          }
        }

        const wheelSpeed = car.speed * 15;
        car.wheels.forEach((w: any) => {
          w.children.forEach((c: any) => {
            if (c.geometry && c.geometry.type === "CylinderGeometry") {
              c.rotation.x += wheelSpeed * dtSec;
            }
          });
        });
      });
    }

    // ==================== PEDESTRIANS ====================
    function updatePedestrians(dt: number) {
      pedestrians.forEach((p) => {
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
          const move = p.speed * (dt / 16);
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
      const time = Date.now() * 0.001;
      schoolKids.forEach((kid, i) => {
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
          const runSpeed = kid.speed * 1.5;
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
            const move = kid.speed * (dt / 16);
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
    function animate(time: number) {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(time - lastTime, 50);
      lastTime = time;

      updateTime(dt);
      updateCars(dt);
      updatePedestrians(dt);
      updateSchoolKids(dt);
      updateFamily(dt);
      controls.update();
      renderer.render(scene, camera);
    }
    animId = requestAnimationFrame(animate);

    // ==================== RESIZE ====================
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Hide loading
    setTimeout(() => setLoading(false), 800);

    // ==================== CLEANUP ====================
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
      {loading && (
        <div className="city-loading">
          <h2>Building Veridia...</h2>
          <div className="loading-bar">
            <div className="loading-progress" />
          </div>
        </div>
      )}

      <div className="ui-time">
        <div className="clock" ref={clockRef}>08:00</div>
        <div className="date" ref={dateRef}>Saturday, May 16</div>
      </div>

      <div className="ui-hint">
        Left drag = rotate &nbsp;&bull;&nbsp; Right drag = pan &nbsp;&bull;&nbsp; Scroll = zoom
      </div>

      <div ref={mountRef} className="city-canvas" />

      <style jsx>{`
        .veridia-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #0a0a0f;
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
        .city-loading.hidden {
          opacity: 0;
          pointer-events: none;
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
          background: #6366f1;
          width: 100%;
          animation: loadPulse 1s ease-in-out infinite;
        }
        @keyframes loadPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
      `}</style>
    </div>
  );
}
