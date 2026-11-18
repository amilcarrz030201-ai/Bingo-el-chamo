import * as THREE from 'three';

// Procedural texture for outfield grass with lawn-mower stripes
function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(0, 0, 512, 512);

  // Alternating lawn striping
  for (let y = 0; y < 512; y += 32) {
    ctx.fillStyle = (y / 32) % 2 === 0 ? '#388e3c' : '#2e7d32';
    ctx.fillRect(0, y, 512, 32);
  }

  // Subtle turf specks
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? '#4caf50' : '#1b5e20';
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

// Procedural texture for infield red clay dirt
function createDirtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 256, 256);

  // Clay pebbles and grit
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const c = Math.random() > 0.5 ? '#d97706' : '#92400e';
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 3, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// Procedural scoreboard canvas texture
function createScoreboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark scoreboard frame
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 512, 256);

  // Header
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(8, 8, 496, 48);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESTADIO ROYALE - BATALLA 3D', 256, 40);

  // Score grids
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('INNING: 9   OUTS: 2   STRIKES: 2   BALLS: 3', 256, 85);

  ctx.fillStyle = '#ef4444';
  ctx.fillText('CJ GROVE STREET  vs  POU UNITED', 256, 120);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 28px monospace';
  ctx.fillText('7  -  6', 256, 165);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText('¡RECOGE ARMAS EN EL CAMPO Y SOBREVIVE!', 256, 215);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural sponsor billboard
function createSponsorTexture(title: string, sub: string, bgColor: string, txtColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = txtColor;
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 58);

  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(sub, 256, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Builds the entire 3D baseball stadium arena map
 */
export function buildBaseballStadium(): {
  group: THREE.Group;
  spawnPoints: THREE.Vector3[];
  weaponSpawnPoints: { position: THREE.Vector3; suggestedWeapon: string }[];
} {
  const stadium = new THREE.Group();
  stadium.name = 'baseball_stadium';

  const grassTex = createGrassTexture();
  const dirtTex = createDirtTexture();

  // 1. OUTFIELD & INFIELD BASE GROUND
  const grassMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 0.9,
    metalness: 0.05,
  });

  const mainFieldGeo = new THREE.CircleGeometry(85, 48);
  mainFieldGeo.rotateX(-Math.PI / 2);
  const mainField = new THREE.Mesh(mainFieldGeo, grassMat);
  mainField.receiveShadow = true;
  stadium.add(mainField);

  // Outer landscape terrain (so the arena is never floating in empty void)
  const outerTerrainGeo = new THREE.RingGeometry(85, 240, 32);
  outerTerrainGeo.rotateX(-Math.PI / 2);
  const outerTerrainMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a1e,
    roughness: 0.95,
  });
  const outerTerrain = new THREE.Mesh(outerTerrainGeo, outerTerrainMat);
  outerTerrain.position.y = -0.05;
  stadium.add(outerTerrain);

  // Distant Mountain / City backdrop ring
  const hillsGeo = new THREE.CylinderGeometry(230, 240, 25, 24, 1, true);
  const hillsMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.9,
    side: THREE.BackSide,
  });
  const hills = new THREE.Mesh(hillsGeo, hillsMat);
  hills.position.y = 8;
  stadium.add(hills);

  // 2. INFIELD CLAY DIRT (El diamante de béisbol)
  const dirtMat = new THREE.MeshStandardMaterial({
    map: dirtTex,
    roughness: 0.85,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  // Diamond shape rotated 45 degrees
  const diamondGeo = new THREE.PlaneGeometry(38, 38);
  diamondGeo.rotateX(-Math.PI / 2);
  diamondGeo.rotateY(Math.PI / 4);
  const diamondMesh = new THREE.Mesh(diamondGeo, dirtMat);
  diamondMesh.position.set(0, 0.02, 19);
  diamondMesh.receiveShadow = true;
  stadium.add(diamondMesh);

  // Circular dirt cutout around home plate
  const homeCircleGeo = new THREE.CircleGeometry(6.5, 24);
  homeCircleGeo.rotateX(-Math.PI / 2);
  const homeCircle = new THREE.Mesh(homeCircleGeo, dirtMat);
  homeCircle.position.set(0, 0.025, 0);
  homeCircle.receiveShadow = true;
  stadium.add(homeCircle);

  // Pitcher's mound (raised circular clay dirt mound)
  const moundGeo = new THREE.CylinderGeometry(4.2, 5.2, 0.35, 24);
  const mound = new THREE.Mesh(moundGeo, dirtMat);
  mound.position.set(0, 0.17, 18.5);
  mound.receiveShadow = true;
  mound.castShadow = true;
  stadium.add(mound);

  // Pitcher's rubber plate
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const rubberGeo = new THREE.BoxGeometry(0.6, 0.04, 0.15);
  const rubber = new THREE.Mesh(rubberGeo, rubberMat);
  rubber.position.set(0, 0.36, 18.5);
  stadium.add(rubber);

  // 3. BASES & HOME PLATE
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });

  // Home plate (pentagon rubber)
  const homeShape = new THREE.Shape();
  homeShape.moveTo(0, 0.4);
  homeShape.lineTo(0.3, 0.1);
  homeShape.lineTo(0.3, -0.3);
  homeShape.lineTo(-0.3, -0.3);
  homeShape.lineTo(-0.3, 0.1);
  homeShape.closePath();
  const homeGeo = new THREE.ExtrudeGeometry(homeShape, { depth: 0.03, bevelEnabled: false });
  homeGeo.rotateX(-Math.PI / 2);
  const homePlate = new THREE.Mesh(homeGeo, baseMat);
  homePlate.position.set(0, 0.03, 0);
  stadium.add(homePlate);

  // 1st Base (+19, 0.05, 19), 2nd Base (0, 0.05, 38), 3rd Base (-19, 0.05, 19)
  const baseBoxGeo = new THREE.BoxGeometry(0.8, 0.12, 0.8);
  const basePositions = [
    new THREE.Vector3(19, 0.06, 19),  // 1st base
    new THREE.Vector3(0, 0.06, 38),   // 2nd base
    new THREE.Vector3(-19, 0.06, 19), // 3rd base
  ];
  basePositions.forEach((pos, idx) => {
    const baseMesh = new THREE.Mesh(baseBoxGeo, baseMat);
    baseMesh.position.copy(pos);
    baseMesh.rotation.y = Math.PI / 4;
    baseMesh.castShadow = true;
    stadium.add(baseMesh);

    // Circular dirt around each base
    const baseDirtGeo = new THREE.CircleGeometry(3.5, 18);
    baseDirtGeo.rotateX(-Math.PI / 2);
    const baseDirt = new THREE.Mesh(baseDirtGeo, dirtMat);
    baseDirt.position.set(pos.x, 0.025, pos.z);
    stadium.add(baseDirt);
  });

  // White Chalk Foul Lines (extending from home plate past 1st and 3rd base to outfield fence)
  const chalkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const foulLineGeo = new THREE.PlaneGeometry(0.18, 105);
  foulLineGeo.rotateX(-Math.PI / 2);

  // Right foul line (toward +x)
  const rightFoul = new THREE.Mesh(foulLineGeo, chalkMat);
  rightFoul.position.set(37, 0.03, 37);
  rightFoul.rotation.y = -Math.PI / 4;
  stadium.add(rightFoul);

  // Left foul line (toward -x)
  const leftFoul = new THREE.Mesh(foulLineGeo, chalkMat);
  leftFoul.position.set(-37, 0.03, 37);
  leftFoul.rotation.y = Math.PI / 4;
  stadium.add(leftFoul);

  // 4. YELLOW FOUL POLES (Postes de foul con alas de malla)
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.6 });
  const poleWingMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.6, transparent: true, opacity: 0.85 });

  const foulPolePositions = [
    new THREE.Vector3(54, 0, 54),
    new THREE.Vector3(-54, 0, 54),
  ];

  foulPolePositions.forEach((pos) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 16, 12), poleMat);
    pole.position.set(pos.x, 8, pos.z);
    pole.castShadow = true;
    stadium.add(pole);

    // Mesh wing on pole
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 10, 1.2), poleWingMat);
    wing.position.set(pos.x, 9, pos.z);
    wing.rotation.y = pos.x > 0 ? -Math.PI / 4 : Math.PI / 4;
    stadium.add(wing);
  });

  // 5. OUTFIELD WALL (Home run fence with sponsor billboards)
  const wallRadius = 74;
  const wallAngleStart = 0.25 * Math.PI;
  const wallAngleEnd = 0.75 * Math.PI;
  const wallSegments = 24;

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 }); // Dark navy padded wall
  const topPadMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }); // Yellow top line

  const billboardConfigs = [
    { title: 'GROVE STREET 4 LIFE', sub: 'Carl Johnson Official Gear', bg: '#15803d', text: '#ffffff' },
    { title: 'POU POTATO CHIPS', sub: '¡Crujientes y Legendarias!', bg: '#b45309', text: '#fef08a' },
    { title: 'LOS SANTOS AIRLINES', sub: 'Fly San Andreas Everyday', bg: '#0284c7', text: '#ffffff' },
    { title: 'FIRULAIS DOG CHOW', sub: 'Poder Canino Máximo', bg: '#b91c1c', text: '#fef3c7' },
    { title: 'DIAMOND ENERGY', sub: 'Regenera Tu Vida al 100%', bg: '#7c3aed', text: '#ffffff' },
    { title: 'GRAND SLAM BURGERS', sub: 'Home Run de Sabor Callejero', bg: '#c2410c', text: '#ffedd5' },
  ];

  let billboardIndex = 0;

  for (let i = 0; i < wallSegments; i++) {
    const a1 = wallAngleStart + (i / wallSegments) * (wallAngleEnd - wallAngleStart);
    const a2 = wallAngleStart + ((i + 1) / wallSegments) * (wallAngleEnd - wallAngleStart);
    const midAngle = (a1 + a2) / 2;

    const x = Math.cos(midAngle) * wallRadius;
    const z = Math.sin(midAngle) * wallRadius;

    const segmentWidth = 2 * wallRadius * Math.sin((wallAngleEnd - wallAngleStart) / (2 * wallSegments)) + 0.3;
    const wallGeo = new THREE.BoxGeometry(segmentWidth, 3.8, 0.5);
    const wallSeg = new THREE.Mesh(wallGeo, wallMat);
    wallSeg.position.set(x, 1.9, z);
    wallSeg.rotation.y = -midAngle + Math.PI / 2;
    wallSeg.castShadow = true;
    wallSeg.receiveShadow = true;
    stadium.add(wallSeg);

    // Yellow top pad
    const topPadGeo = new THREE.BoxGeometry(segmentWidth, 0.25, 0.6);
    const topPad = new THREE.Mesh(topPadGeo, topPadMat);
    topPad.position.set(x, 3.9, z);
    topPad.rotation.y = -midAngle + Math.PI / 2;
    stadium.add(topPad);

    // Add billboards to every 3rd segment
    if (i % 4 === 1) {
      const cfg = billboardConfigs[billboardIndex % billboardConfigs.length];
      billboardIndex++;
      const billTex = createSponsorTexture(cfg.title, cfg.sub, cfg.bg, cfg.text);
      const billMat = new THREE.MeshBasicMaterial({ map: billTex });
      const billGeo = new THREE.PlaneGeometry(segmentWidth * 0.95, 2.4);
      const billMesh = new THREE.Mesh(billGeo, billMat);
      billMesh.position.set(x, 2.0, z);
      billMesh.rotation.y = -midAngle + Math.PI / 2;
      // Slight inward offset
      billMesh.translateZ(0.28);
      stadium.add(billMesh);
    }
  }

  // 6. GIANT OUTFIELD SCOREBOARD (Center Field)
  const scoreGroup = new THREE.Group();
  scoreGroup.position.set(0, 0, 77);
  scoreGroup.rotation.y = Math.PI;

  // Steel lattice legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  [-7, 7].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 14, 8), legMat);
    leg.position.set(lx, 7, 0);
    leg.castShadow = true;
    scoreGroup.add(leg);
  });

  // Scoreboard housing
  const scoreTex = createScoreboardTexture();
  const scoreMat = new THREE.MeshBasicMaterial({ map: scoreTex });
  const scoreScreen = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), scoreMat);
  scoreScreen.position.set(0, 14, 0.2);
  scoreGroup.add(scoreScreen);

  const scoreBack = new THREE.Mesh(new THREE.BoxGeometry(16.5, 8.5, 0.8), legMat);
  scoreBack.position.set(0, 14, -0.2);
  scoreBack.castShadow = true;
  scoreGroup.add(scoreBack);

  stadium.add(scoreGroup);

  // 7. STADIUM GRANDSTAND BLEACHERS (Encircling Home Plate & Infield)
  const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 }); // Concrete
  const seatBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 });
  const seatRedMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 });

  // Behind home plate curved grandstand
  const grandstandTiers = 7;
  for (let t = 0; t < grandstandTiers; t++) {
    const r = 24 + t * 3.2;
    const h = 0.8 + t * 1.4;
    const standArcGeo = new THREE.RingGeometry(r, r + 3.0, 32, 1, Math.PI * 0.95, Math.PI * 1.1);
    standArcGeo.rotateX(-Math.PI / 2);
    const standStep = new THREE.Mesh(standArcGeo, standMat);
    standStep.position.set(0, h, 0);
    standStep.receiveShadow = true;
    stadium.add(standStep);

    // Rows of spectator seats
    const seatColor = t % 2 === 0 ? seatBlueMat : seatRedMat;
    const seatGeo = new THREE.BoxGeometry(0.6, 0.4, 0.5);
    for (let s = 0; s < 18; s++) {
      const angle = Math.PI * 0.98 + (s / 18) * (Math.PI * 1.04);
      const sx = Math.cos(angle) * (r + 1.2);
      const sz = Math.sin(angle) * (r + 1.2);
      const seat = new THREE.Mesh(seatGeo, seatColor);
      seat.position.set(sx, h + 0.25, sz);
      seat.rotation.y = -angle + Math.PI / 2;
      seat.castShadow = true;
      stadium.add(seat);
    }
  }

  // 8. DUGOUTS (Bancas de equipo a los lados de 1ra y 3ra base)
  const dugoutPositions = [
    { x: 26, z: 8, angle: -Math.PI * 0.35 },
    { x: -26, z: 8, angle: Math.PI * 0.35 },
  ];

  dugoutPositions.forEach((dp) => {
    const dugout = new THREE.Group();
    dugout.position.set(dp.x, 0, dp.z);
    dugout.rotation.y = dp.angle;

    // Dugout base platform
    const floor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 4), standMat);
    floor.position.set(0, 0.1, 0);
    floor.receiveShadow = true;
    dugout.add(floor);

    // Dugout back wall
    const wall = new THREE.Mesh(new THREE.BoxGeometry(10, 2.4, 0.3), standMat);
    wall.position.set(0, 1.2, -1.8);
    wall.castShadow = true;
    dugout.add(wall);

    // Dugout roof canopy
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.25, 4.4), roofMat);
    roof.position.set(0, 2.5, 0);
    roof.castShadow = true;
    dugout.add(roof);

    // Team Bench
    const benchMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.45, 0.6), benchMat);
    bench.position.set(0, 0.45, -1.2);
    bench.castShadow = true;
    dugout.add(bench);

    // Water / Gatorade cooler barrel
    const coolerMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const cooler = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 12), coolerMat);
    cooler.position.set(4.2, 0.6, -0.8);
    dugout.add(cooler);

    // Bat rack
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.3), rackMat);
    rack.position.set(-4.0, 0.6, -1.2);
    dugout.add(rack);

    stadium.add(dugout);
  });

  // 9. FOUR STADIUM FLOODLIGHT TOWERS (Torres de Iluminación)
  const towerPositions = [
    new THREE.Vector3(56, 0, 48),   // Right field
    new THREE.Vector3(-56, 0, 48),  // Left field
    new THREE.Vector3(34, 0, -22),  // Right behind home
    new THREE.Vector3(-34, 0, -22), // Left behind home
  ];

  towerPositions.forEach((pos) => {
    const tower = new THREE.Group();
    tower.position.copy(pos);

    // Steel lattice truss column
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.3 });
    const truss = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 26, 6), trussMat);
    truss.position.y = 13;
    truss.castShadow = true;
    tower.add(truss);

    // Head frame with light lamps
    const headFrame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.6, 0.8), trussMat);
    headFrame.position.y = 26;
    headFrame.lookAt(0, 5, 20); // Aim lamps toward center of diamond
    tower.add(headFrame);

    // Glowing bright light panel
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const lampPanel = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.2), lampMat);
    lampPanel.position.set(0, 0, 0.42);
    headFrame.add(lampPanel);

    // Add actual spot light from two main towers
    if (Math.abs(pos.x) === 56) {
      const spot = new THREE.SpotLight(0xfff5ea, 1.2, 120, Math.PI / 4, 0.4, 1);
      spot.position.set(pos.x, 26, pos.z);
      spot.target.position.set(0, 0, 20);
      stadium.add(spot);
      stadium.add(spot.target);
    }

    stadium.add(tower);
  });

  // 10. TACTICAL COVER PROPS (Batting cage, metal crates, barrels, trash cans)
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 }); // Wooden crates
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4, metalness: 0.5 }); // Blue barrels

  const coverLocations = [
    { pos: new THREE.Vector3(12, 0.6, 6), type: 'crate' },
    { pos: new THREE.Vector3(-12, 0.6, 6), type: 'crate' },
    { pos: new THREE.Vector3(25, 0.6, 32), type: 'barrel' },
    { pos: new THREE.Vector3(-25, 0.6, 32), type: 'barrel' },
    { pos: new THREE.Vector3(0, 0.6, 52), type: 'crate' },
    { pos: new THREE.Vector3(38, 0.6, 16), type: 'barrel' },
    { pos: new THREE.Vector3(-38, 0.6, 16), type: 'crate' },
  ];

  coverLocations.forEach(({ pos, type }) => {
    if (type === 'crate') {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), crateMat);
      crate.position.copy(pos);
      crate.castShadow = true;
      crate.receiveShadow = true;
      stadium.add(crate);
    } else {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.1, 12), barrelMat);
      barrel.position.copy(pos);
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      stadium.add(barrel);
    }
  });

  // Batting Practice Cage near third baseline
  const cageMat = new THREE.MeshStandardMaterial({ color: 0x475569, wireframe: true });
  const cage = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 5.5), cageMat);
  cage.position.set(-28, 1.6, -6);
  stadium.add(cage);

  // SPAWN POINTS for fighters
  const spawnPoints: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 3),      // Near home plate
    new THREE.Vector3(18, 0, 18),    // Near 1st base
    new THREE.Vector3(0, 0, 36),     // Near 2nd base
    new THREE.Vector3(-18, 0, 18),   // Near 3rd base
    new THREE.Vector3(0, 0.35, 18.5),// Pitcher's mound
    new THREE.Vector3(28, 0, 38),    // Right-center field
    new THREE.Vector3(-28, 0, 38),   // Left-center field
    new THREE.Vector3(0, 0, 54),     // Deep center field
    new THREE.Vector3(22, 0, 5),     // Near 1st base dugout
    new THREE.Vector3(-22, 0, 5),    // Near 3rd base dugout
  ];

  // WEAPON SPAWN POINTS scattered around the field
  const weaponSpawnPoints = [
    { position: new THREE.Vector3(0, 0.4, 18.5), suggestedWeapon: 'bate' },     // Pitcher's mound -> Bate de Béisbol
    { position: new THREE.Vector3(3, 0, 1), suggestedWeapon: 'palo' },          // Home plate -> Palo de Madera
    { position: new THREE.Vector3(19, 0, 17), suggestedWeapon: 'bate' },        // 1st base -> Bate
    { position: new THREE.Vector3(-19, 0, 17), suggestedWeapon: 'cepillo' },    // 3rd base -> Cepillo de barrer
    { position: new THREE.Vector3(0, 0, 40), suggestedWeapon: 'pala' },         // 2nd base -> Pala de construcción
    { position: new THREE.Vector3(24, 0, 9), suggestedWeapon: 'cepillo' },      // Dugout 1 -> Cepillo de barrer
    { position: new THREE.Vector3(-24, 0, 9), suggestedWeapon: 'palo' },        // Dugout 2 -> Palo de madera
    { position: new THREE.Vector3(35, 0, 35), suggestedWeapon: 'tuberia' },     // Right field -> Tubería de acero
    { position: new THREE.Vector3(-35, 0, 35), suggestedWeapon: 'pala' },       // Left field -> Pala
    { position: new THREE.Vector3(0, 0, 58), suggestedWeapon: 'tuberia' },      // Deep center field -> Tubería
    { position: new THREE.Vector3(14, 0, 28), suggestedWeapon: 'bate' },        // Shortstop area -> Bate
    { position: new THREE.Vector3(-14, 0, 28), suggestedWeapon: 'palo' },       // Infield grass -> Palo
  ];

  return { group: stadium, spawnPoints, weaponSpawnPoints };
}
