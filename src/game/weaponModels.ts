import * as THREE from 'three';
import { WeaponType } from './types';

// Procedural texture for wood grain
function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 0, 128, 256);

  // Wood rings / streaks
  for (let y = 0; y < 256; y += 4) {
    const darkness = Math.sin(y * 0.15) * 20 + (Math.random() * 15 - 7);
    const r = Math.min(255, Math.max(0, 139 + darkness));
    const g = Math.min(255, Math.max(0, 90 + darkness * 0.7));
    const b = Math.min(255, Math.max(0, 43 + darkness * 0.4));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, 128, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural metal scratch texture
function createMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * 128;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + (Math.random() * 10 - 5));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const woodTex = createWoodTexture();
const metalTex = createMetalTexture();

/**
 * Creates 3D model for each weapon type
 */
export function createWeaponMesh(type: WeaponType): THREE.Group {
  const group = new THREE.Group();
  group.name = `weapon_${type}`;

  if (type === 'fists') {
    // Empty group for fists
    return group;
  }

  switch (type) {
    case 'palo': {
      // Palo de Madera (Wooden branch / club)
      const woodMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.85,
        metalness: 0.05,
        color: 0x8b5226,
      });

      // Main stick shaft
      const shaftGeo = new THREE.CylinderGeometry(0.045, 0.065, 1.35, 10);
      const shaft = new THREE.Mesh(shaftGeo, woodMat);
      shaft.position.y = 0.55;
      shaft.castShadow = true;
      group.add(shaft);

      // Knots / thick end
      const knobGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const knob = new THREE.Mesh(knobGeo, woodMat);
      knob.position.y = 1.18;
      knob.scale.set(1.1, 0.8, 1.2);
      group.add(knob);

      // Handle grip wrap at bottom
      const wrapMat = new THREE.MeshStandardMaterial({
        color: 0x3e2723,
        roughness: 0.9,
      });
      const wrapGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.28, 10);
      const wrap = new THREE.Mesh(wrapGeo, wrapMat);
      wrap.position.y = 0.12;
      group.add(wrap);
      break;
    }

    case 'cepillo': {
      // Cepillo de Barrer / Escoba (Broom)
      const handleMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Sky blue aluminum handle
        metalness: 0.7,
        roughness: 0.3,
      });
      const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.55, 10);
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.y = 0.75;
      handle.castShadow = true;
      group.add(handle);

      // Handle plastic cap
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.5 });
      const capGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.08, 8);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.02;
      group.add(cap);

      // Broom head block (plastic base)
      const headMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const headGeo = new THREE.BoxGeometry(0.48, 0.09, 0.12);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.48;
      head.castShadow = true;
      group.add(head);

      // Bristles (cerdas amarillas de barrer)
      const bristleMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.9,
        metalness: 0.0,
      });
      const bristleGeo = new THREE.BoxGeometry(0.5, 0.25, 0.1);
      const bristles = new THREE.Mesh(bristleGeo, bristleMat);
      bristles.position.y = 1.63;
      bristles.castShadow = true;
      group.add(bristles);
      break;
    }

    case 'pala': {
      // Pala de Construcción (Construction Shovel)
      const shaftMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.75,
        metalness: 0.1,
        color: 0xa16207,
      });
      const shaftGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.25, 10);
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.y = 0.65;
      shaft.castShadow = true;
      group.add(shaft);

      // Steel collar
      const metalMat = new THREE.MeshStandardMaterial({
        map: metalTex,
        roughness: 0.25,
        metalness: 0.85,
        color: 0x94a3b8,
      });
      const collarGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.12, 10);
      const collar = new THREE.Mesh(collarGeo, metalMat);
      collar.position.y = 1.15;
      group.add(collar);

      // Shovel blade (curved metallic spade)
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(-0.16, 0);
      bladeShape.lineTo(0.16, 0);
      bladeShape.lineTo(0.16, 0.26);
      bladeShape.quadraticCurveTo(0, 0.45, -0.16, 0.26);
      bladeShape.closePath();

      const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 };
      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      bladeGeo.center();
      const blade = new THREE.Mesh(bladeGeo, metalMat);
      blade.position.set(0, 1.34, 0.02);
      blade.rotation.x = Math.PI * 0.08;
      blade.castShadow = true;
      group.add(blade);

      // D-Handle at the bottom grip
      const dGripGeo = new THREE.TorusGeometry(0.065, 0.018, 8, 16, Math.PI);
      const dGrip = new THREE.Mesh(dGripGeo, metalMat);
      dGrip.position.set(0, 0.06, 0);
      dGrip.rotation.z = Math.PI;
      group.add(dGrip);
      break;
    }

    case 'bate': {
      // Bate de Béisbol (Baseball Bat)
      const batMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Amber varnished wood or aluminum gold
        roughness: 0.35,
        metalness: 0.4,
      });

      // Tapered bat barrel
      const batGeo = new THREE.CylinderGeometry(0.07, 0.032, 1.15, 14);
      const bat = new THREE.Mesh(batGeo, batMat);
      bat.position.y = 0.62;
      bat.castShadow = true;
      group.add(bat);

      // Rounded bat top end
      const capGeo = new THREE.SphereGeometry(0.07, 12, 8);
      const batCap = new THREE.Mesh(capGeo, batMat);
      batCap.position.y = 1.18;
      group.add(batCap);

      // Handle grip tape
      const tapeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
      const tapeGeo = new THREE.CylinderGeometry(0.033, 0.033, 0.3, 12);
      const tape = new THREE.Mesh(tapeGeo, tapeMat);
      tape.position.y = 0.16;
      group.add(tape);

      // Bottom knob
      const knobGeo = new THREE.CylinderGeometry(0.05, 0.048, 0.04, 12);
      const knob = new THREE.Mesh(knobGeo, batMat);
      knob.position.y = 0.02;
      group.add(knob);
      break;
    }

    case 'tuberia': {
      // Tubería de Acero (Steel Pipe)
      const pipeMat = new THREE.MeshStandardMaterial({
        map: metalTex,
        roughness: 0.4,
        metalness: 0.9,
        color: 0x64748b,
      });

      // Main pipe
      const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.25, 12);
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.y = 0.6;
      pipe.castShadow = true;
      group.add(pipe);

      // Threaded coupling connectors
      const jointMat = new THREE.MeshStandardMaterial({
        roughness: 0.6,
        metalness: 0.95,
        color: 0x475569,
      });
      const jointGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.09, 12);

      const joint1 = new THREE.Mesh(jointGeo, jointMat);
      joint1.position.y = 1.15;
      group.add(joint1);

      const joint2 = new THREE.Mesh(jointGeo, jointMat);
      joint2.position.y = 0.06;
      group.add(joint2);

      // 90 degree elbow at end
      const elbowGeo = new THREE.TorusGeometry(0.07, 0.038, 8, 12, Math.PI / 2);
      const elbow = new THREE.Mesh(elbowGeo, jointMat);
      elbow.position.set(0.07, 1.2, 0);
      elbow.rotation.z = -Math.PI / 2;
      group.add(elbow);
      break;
    }
  }

  return group;
}

/**
 * Creates floating pickup container with rotating weapon & glowing floor ring
 */
export function createPickupMarker(type: WeaponType, position: THREE.Vector3): {
  group: THREE.Group;
  weaponMesh: THREE.Group;
  ringMesh: THREE.Mesh;
} {
  const container = new THREE.Group();
  container.position.copy(position);

  // Ground beacon disc
  const ringGeo = new THREE.RingGeometry(0.8, 1.1, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: type === 'bate' ? 0xfacc15 : type === 'pala' ? 0x38bdf8 : type === 'cepillo' ? 0x4ade80 : 0xf97316,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = 0.06;
  container.add(ringMesh);

  // Pillar light beam
  const beamGeo = new THREE.CylinderGeometry(0.15, 0.4, 2.5, 12, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: ringMat.color,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 1.25;
  container.add(beam);

  // Weapon mesh floating above
  const weaponMesh = createWeaponMesh(type);
  weaponMesh.position.y = 0.9;
  weaponMesh.rotation.z = Math.PI * 0.15;
  container.add(weaponMesh);

  return { group: container, weaponMesh, ringMesh };
}
