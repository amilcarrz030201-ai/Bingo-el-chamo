import * as THREE from 'three';
import { CharacterId, CharacterLimbs } from './types';

/**
 * Creates 3D character mesh with articulated limbs and weapon attachment sockets.
 * Adheres to Three.js directives: composite 8-15 part procedural models, varied roughness/metalness, grounded bottom-center.
 */
export function createCharacterModel(characterId: CharacterId): {
  group: THREE.Group;
  limbs: CharacterLimbs;
  height: number;
} {
  const root = new THREE.Group();
  root.name = `character_${characterId}`;
  const limbs: CharacterLimbs = {};
  let height = 1.8;

  switch (characterId) {
    case 'cj': {
      // CARL JOHNSON (GTA San Andreas)
      height = 1.85;

      // Pelvis / Hips
      const hipMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 }); // Blue jeans
      const hipGeo = new THREE.BoxGeometry(0.44, 0.22, 0.28);
      const hips = new THREE.Mesh(hipGeo, hipMat);
      hips.position.y = 0.95;
      hips.castShadow = true;
      root.add(hips);
      limbs.body = hips;

      // Torso with White Tank Top (Camiseta de tirantes blanca)
      const torsoMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
      const torsoGeo = new THREE.BoxGeometry(0.48, 0.48, 0.28);
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.set(0, 0.35, 0);
      torso.castShadow = true;
      hips.add(torso);

      // Chest muscles / straps
      const skinMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.7 }); // Dark skin tone
      const chestSkinGeo = new THREE.BoxGeometry(0.3, 0.18, 0.29);
      const chestSkin = new THREE.Mesh(chestSkinGeo, skinMat);
      chestSkin.position.set(0, 0.16, 0.01);
      torso.add(chestSkin);

      // Silver chain necklace
      const chainMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
      const chainGeo = new THREE.TorusGeometry(0.12, 0.015, 8, 16);
      const chain = new THREE.Mesh(chainGeo, chainMat);
      chain.position.set(0, 0.18, 0.12);
      chain.rotation.x = Math.PI * 0.25;
      torso.add(chain);

      // Head & Face
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.35, 0);
      torso.add(headPivot);
      limbs.head = headPivot;

      const headGeo = new THREE.BoxGeometry(0.24, 0.26, 0.25);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 0.13;
      head.castShadow = true;
      headPivot.add(head);

      // Hair (buzz cut black hair)
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
      const hairGeo = new THREE.BoxGeometry(0.25, 0.08, 0.26);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 0.24;
      headPivot.add(hair);

      // Beard / Goatee
      const beardGeo = new THREE.BoxGeometry(0.12, 0.07, 0.03);
      const beard = new THREE.Mesh(beardGeo, hairMat);
      beard.position.set(0, 0.06, 0.13);
      headPivot.add(beard);

      // Eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
      [-0.06, 0.06].forEach((x) => {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.03, 0.02), eyeMat);
        eye.position.set(x, 0.15, 0.13);
        headPivot.add(eye);
        const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.025), pupilMat);
        pupil.position.set(x, 0.15, 0.135);
        headPivot.add(pupil);
      });

      // Left Arm
      const leftArmPivot = new THREE.Group();
      leftArmPivot.position.set(-0.31, 0.18, 0);
      torso.add(leftArmPivot);
      limbs.leftArm = leftArmPivot;

      const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.28, 8), skinMat);
      leftBicep.position.y = -0.14;
      leftArmPivot.add(leftBicep);

      const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.28, 8), skinMat);
      leftForearm.position.y = -0.4;
      leftArmPivot.add(leftForearm);

      // Right Arm (Weapon wielding arm)
      const rightArmPivot = new THREE.Group();
      rightArmPivot.position.set(0.31, 0.18, 0);
      torso.add(rightArmPivot);
      limbs.rightArm = rightArmPivot;

      const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.28, 8), skinMat);
      rightBicep.position.y = -0.14;
      rightArmPivot.add(rightBicep);

      const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.28, 8), skinMat);
      rightForearm.position.y = -0.4;
      rightArmPivot.add(rightForearm);

      // Weapon Socket in Right Hand
      const weaponSocket = new THREE.Group();
      weaponSocket.position.set(0, -0.52, 0.08);
      rightArmPivot.add(weaponSocket);
      limbs.weaponSocket = weaponSocket;

      // Legs (Denim Jeans)
      const leftLegPivot = new THREE.Group();
      leftLegPivot.position.set(-0.13, -0.11, 0);
      hips.add(leftLegPivot);
      limbs.leftLeg = leftLegPivot;

      const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.44, 8), hipMat);
      leftThigh.position.y = -0.22;
      leftLegPivot.add(leftThigh);

      const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 8), hipMat);
      leftShin.position.y = -0.62;
      leftLegPivot.add(leftShin);

      // Sneaker Left
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
      const soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
      const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), shoeMat);
      leftShoe.position.set(0, -0.84, 0.05);
      leftLegPivot.add(leftShoe);
      const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.28), soleMat);
      leftSole.position.set(0, -0.89, 0.05);
      leftLegPivot.add(leftSole);

      // Right Leg
      const rightLegPivot = new THREE.Group();
      rightLegPivot.position.set(0.13, -0.11, 0);
      hips.add(rightLegPivot);
      limbs.rightLeg = rightLegPivot;

      const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.44, 8), hipMat);
      rightThigh.position.y = -0.22;
      rightLegPivot.add(rightThigh);

      const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 8), hipMat);
      rightShin.position.y = -0.62;
      rightLegPivot.add(rightShin);

      // Sneaker Right
      const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), shoeMat);
      rightShoe.position.set(0, -0.84, 0.05);
      rightLegPivot.add(rightShoe);
      const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.28), soleMat);
      rightSole.position.set(0, -0.89, 0.05);
      rightLegPivot.add(rightSole);
      break;
    }

    case 'pou': {
      // POU (La papa alienígena)
      height = 1.35;

      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xbf8244, // Iconic warm potato brown
        roughness: 0.75,
        metalness: 0.05,
      });

      // Smooth pear-shaped body using grouped spheres/capsule
      const bodyPivot = new THREE.Group();
      bodyPivot.position.y = 0.55;
      root.add(bodyPivot);
      limbs.body = bodyPivot;

      // Bottom fat portion
      const lowerBody = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 14), bodyMat);
      lowerBody.scale.set(1.0, 0.85, 0.9);
      lowerBody.castShadow = true;
      bodyPivot.add(lowerBody);

      // Upper tapered head portion
      const upperBody = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.75, 16), bodyMat);
      upperBody.position.y = 0.35;
      upperBody.scale.set(1.0, 1.0, 0.85);
      upperBody.castShadow = true;
      bodyPivot.add(upperBody);

      // Rounded top cap
      const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), bodyMat);
      topCap.position.y = 0.68;
      bodyPivot.add(topCap);

      // BIG CARTOON EYES
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
      const eyelidMat = new THREE.MeshStandardMaterial({ color: 0x9a5e27, roughness: 0.8 });

      [-0.18, 0.18].forEach((x) => {
        // Eye sphere
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), eyeWhiteMat);
        eye.position.set(x, 0.28, 0.42);
        eye.scale.set(1.0, 1.15, 0.6);
        bodyPivot.add(eye);

        // Pupil looking slightly forward/inward
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), pupilMat);
        pupil.position.set(x * 0.9, 0.28, 0.51);
        pupil.scale.set(1.0, 1.0, 0.4);
        bodyPivot.add(pupil);

        // Eyelid arch
        const eyelid = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 12, Math.PI), eyelidMat);
        eyelid.position.set(x, 0.39, 0.43);
        bodyPivot.add(eyelid);
      });

      // Iconic straight/wobbly mouth
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x271406 });
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.05), mouthMat);
      mouth.position.set(0, 0.08, 0.46);
      mouth.rotation.z = -0.04;
      bodyPivot.add(mouth);

      // Pou Cute Arms
      const armMat = new THREE.MeshStandardMaterial({ color: 0xa96e36, roughness: 0.8 });

      // Left Arm
      const leftArmPivot = new THREE.Group();
      leftArmPivot.position.set(-0.46, 0.12, 0);
      bodyPivot.add(leftArmPivot);
      limbs.leftArm = leftArmPivot;

      const leftArmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), armMat);
      leftArmMesh.scale.set(0.9, 1.6, 0.9);
      leftArmMesh.position.set(-0.06, -0.08, 0.06);
      leftArmPivot.add(leftArmMesh);

      // Right Arm (Weapon wielding)
      const rightArmPivot = new THREE.Group();
      rightArmPivot.position.set(0.46, 0.12, 0);
      bodyPivot.add(rightArmPivot);
      limbs.rightArm = rightArmPivot;

      const rightArmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), armMat);
      rightArmMesh.scale.set(0.9, 1.6, 0.9);
      rightArmMesh.position.set(0.06, -0.08, 0.06);
      rightArmPivot.add(rightArmMesh);

      // Weapon socket
      const weaponSocket = new THREE.Group();
      weaponSocket.position.set(0.12, -0.15, 0.2);
      rightArmPivot.add(weaponSocket);
      limbs.weaponSocket = weaponSocket;

      // Little stubby hopping feet
      const footMat = new THREE.MeshStandardMaterial({ color: 0x8a5223, roughness: 0.85 });
      const leftFootPivot = new THREE.Group();
      leftFootPivot.position.set(-0.22, -0.42, 0.06);
      bodyPivot.add(leftFootPivot);
      limbs.leftLeg = leftFootPivot;

      const lFoot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), footMat);
      lFoot.scale.set(1.0, 0.6, 1.4);
      leftFootPivot.add(lFoot);

      const rightFootPivot = new THREE.Group();
      rightFootPivot.position.set(0.22, -0.42, 0.06);
      bodyPivot.add(rightFootPivot);
      limbs.rightLeg = rightFootPivot;

      const rFoot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), footMat);
      rFoot.scale.set(1.0, 0.6, 1.4);
      rightFootPivot.add(rFoot);
      break;
    }

    case 'perro': {
      // FIRULAIS EL PERRO (Quadruped Dog)
      height = 1.25;

      const furMat = new THREE.MeshStandardMaterial({
        color: 0xc27c38, // Golden retriever / street dog honey brown
        roughness: 0.85,
        metalness: 0.05,
      });

      // Dog Torso
      const bodyPivot = new THREE.Group();
      bodyPivot.position.set(0, 0.72, 0);
      root.add(bodyPivot);
      limbs.body = bodyPivot;

      // Barrel chest and belly
      const torsoGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.75, 12);
      torsoGeo.rotateX(Math.PI / 2);
      const torso = new THREE.Mesh(torsoGeo, furMat);
      torso.castShadow = true;
      bodyPivot.add(torso);

      // Red Collar with Gold Medallion
      const collarMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
      const collarGeo = new THREE.TorusGeometry(0.22, 0.035, 8, 16);
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.position.set(0, 0.1, 0.32);
      bodyPivot.add(collar);

      const tagMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 });
      const tagGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 10);
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.set(0, -0.06, 0.36);
      bodyPivot.add(tag);

      // Dog Head & Snout
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.25, 0.38);
      bodyPivot.add(headPivot);
      limbs.head = headPivot;

      // Skull
      const skullGeo = new THREE.SphereGeometry(0.22, 12, 10);
      const skull = new THREE.Mesh(skullGeo, furMat);
      skull.castShadow = true;
      headPivot.add(skull);

      // Snout / Muzzle
      const muzzleMat = new THREE.MeshStandardMaterial({ color: 0x935622, roughness: 0.9 });
      const muzzleGeo = new THREE.BoxGeometry(0.18, 0.14, 0.24);
      const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
      muzzle.position.set(0, -0.04, 0.2);
      headPivot.add(muzzle);

      // Wet Black Nose
      const noseMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.1 });
      const noseGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0, 0.01, 0.33);
      headPivot.add(nose);

      // Floppy Dog Ears
      [-0.18, 0.18].forEach((x) => {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.12), muzzleMat);
        ear.position.set(x, 0.04, 0.02);
        ear.rotation.z = (x < 0 ? 0.35 : -0.35);
        headPivot.add(ear);
      });

      // Eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
      [-0.1, 0.1].forEach((x) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
        eye.position.set(x, 0.09, 0.18);
        headPivot.add(eye);
      });

      // Mouth Weapon Socket (Dog holds weapons hilariously in its mouth!)
      const mouthSocket = new THREE.Group();
      mouthSocket.position.set(0, -0.06, 0.32);
      mouthSocket.rotation.x = -Math.PI * 0.1;
      headPivot.add(mouthSocket);
      limbs.mouthSocket = mouthSocket;
      limbs.weaponSocket = mouthSocket;

      // Wagging Tail
      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0.15, -0.38);
      bodyPivot.add(tailPivot);
      limbs.tail = tailPivot;

      const tailGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.38, 8);
      tailGeo.rotateX(-Math.PI * 0.35);
      const tail = new THREE.Mesh(tailGeo, furMat);
      tailPivot.add(tail);

      // 4 Articulated Legs
      const legGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.48, 8);
      const pawGeo = new THREE.BoxGeometry(0.1, 0.06, 0.14);
      const pawMat = new THREE.MeshStandardMaterial({ color: 0x935622, roughness: 0.9 });

      // Front Left Leg
      const flLeg = new THREE.Group();
      flLeg.position.set(-0.16, -0.15, 0.24);
      bodyPivot.add(flLeg);
      limbs.leftArm = flLeg; // Mapped for animation
      const flMesh = new THREE.Mesh(legGeo, furMat);
      flMesh.position.y = -0.24;
      flLeg.add(flMesh);
      const flPaw = new THREE.Mesh(pawGeo, pawMat);
      flPaw.position.set(0, -0.48, 0.03);
      flLeg.add(flPaw);

      // Front Right Leg
      const frLeg = new THREE.Group();
      frLeg.position.set(0.16, -0.15, 0.24);
      bodyPivot.add(frLeg);
      limbs.rightArm = frLeg;
      const frMesh = new THREE.Mesh(legGeo, furMat);
      frMesh.position.y = -0.24;
      frLeg.add(frMesh);
      const frPaw = new THREE.Mesh(pawGeo, pawMat);
      frPaw.position.set(0, -0.48, 0.03);
      frLeg.add(frPaw);

      // Back Left Leg
      const blLeg = new THREE.Group();
      blLeg.position.set(-0.16, -0.15, -0.24);
      bodyPivot.add(blLeg);
      limbs.leftLeg = blLeg;
      const blMesh = new THREE.Mesh(legGeo, furMat);
      blMesh.position.y = -0.24;
      blLeg.add(blMesh);
      const blPaw = new THREE.Mesh(pawGeo, pawMat);
      blPaw.position.set(0, -0.48, 0.03);
      blLeg.add(blPaw);

      // Back Right Leg
      const brLeg = new THREE.Group();
      brLeg.position.set(0.16, -0.15, -0.24);
      bodyPivot.add(brLeg);
      limbs.rightLeg = brLeg;
      const brMesh = new THREE.Mesh(legGeo, furMat);
      brMesh.position.y = -0.24;
      brLeg.add(brMesh);
      const brPaw = new THREE.Mesh(pawGeo, pawMat);
      brPaw.position.set(0, -0.48, 0.03);
      brLeg.add(brPaw);
      break;
    }

    case 'boxer': {
      // BOXEADOR (Heavyweight Champion)
      height = 1.95;

      const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.65 });
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 }); // Red boxing trunks
      const gloveMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4, metalness: 0.1 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });

      // Hips
      const hips = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.3), trunkMat);
      hips.position.y = 1.0;
      hips.castShadow = true;
      root.add(hips);
      limbs.body = hips;

      // Gold waistband champion belt
      const belt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.32), goldMat);
      belt.position.y = 0.08;
      hips.add(belt);

      // Muscular Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.52, 0.32), skinMat);
      torso.position.set(0, 0.38, 0);
      torso.castShadow = true;
      hips.add(torso);

      // Head
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.38, 0);
      torso.add(headPivot);
      limbs.head = headPivot;

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), skinMat);
      head.position.y = 0.14;
      headPivot.add(head);

      // Yellow Headband
      const headband = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.06, 0.27), goldMat);
      headband.position.y = 0.22;
      headPivot.add(headband);

      // Big Boxing Gloves / Arms
      const leftArmPivot = new THREE.Group();
      leftArmPivot.position.set(-0.36, 0.2, 0);
      torso.add(leftArmPivot);
      limbs.leftArm = leftArmPivot;

      const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 8), skinMat);
      leftBicep.position.y = -0.16;
      leftArmPivot.add(leftBicep);

      const leftGlove = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), gloveMat);
      leftGlove.position.y = -0.42;
      leftArmPivot.add(leftGlove);

      const rightArmPivot = new THREE.Group();
      rightArmPivot.position.set(0.36, 0.2, 0);
      torso.add(rightArmPivot);
      limbs.rightArm = rightArmPivot;

      const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 8), skinMat);
      rightBicep.position.y = -0.16;
      rightArmPivot.add(rightBicep);

      const rightGlove = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), gloveMat);
      rightGlove.position.y = -0.42;
      rightArmPivot.add(rightGlove);

      // Weapon socket
      const weaponSocket = new THREE.Group();
      weaponSocket.position.set(0, -0.48, 0.1);
      rightArmPivot.add(weaponSocket);
      limbs.weaponSocket = weaponSocket;

      // Legs
      const leftLegPivot = new THREE.Group();
      leftLegPivot.position.set(-0.15, -0.12, 0);
      hips.add(leftLegPivot);
      limbs.leftLeg = leftLegPivot;

      const leftLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.8, 8), skinMat);
      leftLegMesh.position.y = -0.4;
      leftLegPivot.add(leftLegMesh);

      const rightLegPivot = new THREE.Group();
      rightLegPivot.position.set(0.15, -0.12, 0);
      hips.add(rightLegPivot);
      limbs.rightLeg = rightLegPivot;

      const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.8, 8), skinMat);
      rightLegMesh.position.y = -0.4;
      rightLegPivot.add(rightLegMesh);
      break;
    }

    case 'alien': {
      // ALIEN MARCIANITO
      height = 1.7;

      const alienMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 });
      const suitMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.6 });

      const hips = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.24), suitMat);
      hips.position.y = 0.85;
      root.add(hips);
      limbs.body = hips;

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.24), suitMat);
      torso.position.set(0, 0.31, 0);
      hips.add(torso);

      // Oversized Alien Head
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.32, 0);
      torso.add(headPivot);
      limbs.head = headPivot;

      const headGeo = new THREE.ConeGeometry(0.28, 0.44, 14);
      headGeo.rotateX(Math.PI);
      const head = new THREE.Mesh(headGeo, alienMat);
      head.position.y = 0.24;
      headPivot.add(head);

      // Black almond shaped eyes
      [-0.1, 0.1].forEach((x) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), eyeMat);
        eye.position.set(x, 0.24, 0.16);
        eye.scale.set(0.8, 1.4, 0.5);
        eye.rotation.z = (x < 0 ? -0.3 : 0.3);
        headPivot.add(eye);
      });

      // Slender Arms
      const leftArmPivot = new THREE.Group();
      leftArmPivot.position.set(-0.26, 0.16, 0);
      torso.add(leftArmPivot);
      limbs.leftArm = leftArmPivot;

      const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.55, 8), alienMat);
      leftArmMesh.position.y = -0.28;
      leftArmPivot.add(leftArmMesh);

      const rightArmPivot = new THREE.Group();
      rightArmPivot.position.set(0.26, 0.16, 0);
      torso.add(rightArmPivot);
      limbs.rightArm = rightArmPivot;

      const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.55, 8), alienMat);
      rightArmMesh.position.y = -0.28;
      rightArmPivot.add(rightArmMesh);

      const weaponSocket = new THREE.Group();
      weaponSocket.position.set(0, -0.56, 0.08);
      rightArmPivot.add(weaponSocket);
      limbs.weaponSocket = weaponSocket;

      // Legs
      const leftLegPivot = new THREE.Group();
      leftLegPivot.position.set(-0.11, -0.1, 0);
      hips.add(leftLegPivot);
      limbs.leftLeg = leftLegPivot;

      const leftLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.75, 8), suitMat);
      leftLegMesh.position.y = -0.38;
      leftLegPivot.add(leftLegMesh);

      const rightLegPivot = new THREE.Group();
      rightLegPivot.position.set(0.11, -0.1, 0);
      hips.add(rightLegPivot);
      limbs.rightLeg = rightLegPivot;

      const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.75, 8), suitMat);
      rightLegMesh.position.y = -0.38;
      rightLegPivot.add(rightLegMesh);
      break;
    }
  }

  // Shadow casting on all meshes
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return { group: root, limbs, height };
}

/**
 * Animate character limbs based on locomotion and combat action
 */
export function animateCharacterLimbs(
  characterId: CharacterId,
  limbs: CharacterLimbs,
  speed: number, // 0 if idle, >0 if moving
  time: number,
  isAttacking: boolean,
  attackProgress: number, // 0 to 1
  isGrounded: boolean,
  isDead: boolean
) {
  if (isDead) {
    // Ragdoll KO position on the floor
    if (limbs.body) {
      limbs.body.rotation.x = -Math.PI / 2;
      limbs.body.position.y = 0.2;
    }
    if (limbs.leftArm) limbs.leftArm.rotation.set(0.4, 0, -0.8);
    if (limbs.rightArm) limbs.rightArm.rotation.set(0.4, 0, 0.8);
    if (limbs.leftLeg) limbs.leftLeg.rotation.set(0.2, 0, -0.2);
    if (limbs.rightLeg) limbs.rightLeg.rotation.set(0.2, 0, 0.2);
    return;
  }

  const isQuadruped = characterId === 'perro';
  const walkFreq = 9.0;
  const walkCycle = Math.sin(time * walkFreq);

  // Jump animation
  if (!isGrounded) {
    if (limbs.leftLeg) limbs.leftLeg.rotation.x = -0.4;
    if (limbs.rightLeg) limbs.rightLeg.rotation.x = 0.3;
    if (limbs.leftArm && !isAttacking) limbs.leftArm.rotation.x = -0.6;
    if (limbs.rightArm && !isAttacking) limbs.rightArm.rotation.x = -0.6;
    return;
  }

  if (isQuadruped) {
    // DOG ANIMATION
    if (speed > 0.1) {
      // Quadruped trot: diagonal leg pairs move together
      if (limbs.leftArm) limbs.leftArm.rotation.x = walkCycle * 0.7; // Front Left
      if (limbs.rightArm) limbs.rightArm.rotation.x = -walkCycle * 0.7; // Front Right
      if (limbs.leftLeg) limbs.leftLeg.rotation.x = -walkCycle * 0.7; // Back Left
      if (limbs.rightLeg) limbs.rightLeg.rotation.x = walkCycle * 0.7; // Back Right
      if (limbs.body) limbs.body.position.y = 0.72 + Math.abs(walkCycle) * 0.06;
    } else {
      // Idle dog pant / breathing
      if (limbs.leftArm) limbs.leftArm.rotation.x = 0;
      if (limbs.rightArm) limbs.rightArm.rotation.x = 0;
      if (limbs.leftLeg) limbs.leftLeg.rotation.x = 0;
      if (limbs.rightLeg) limbs.rightLeg.rotation.x = 0;
      if (limbs.body) limbs.body.position.y = 0.72 + Math.sin(time * 3) * 0.02;
    }

    // Wagging tail
    if (limbs.tail) {
      limbs.tail.rotation.y = Math.sin(time * 12) * 0.6;
    }

    // Dog attack: head lunges forward and bites/swings weapon held in mouth!
    if (isAttacking && limbs.head) {
      const swing = Math.sin(attackProgress * Math.PI);
      limbs.head.rotation.y = Math.sin(attackProgress * Math.PI * 2) * 0.8;
      limbs.head.position.z = 0.38 + swing * 0.25;
    } else if (limbs.head) {
      limbs.head.rotation.y = 0;
      limbs.head.position.z = 0.38;
    }
    return;
  }

  // BIPED ANIMATION (CJ, Pou, Boxer, Alien)
  if (speed > 0.1) {
    // Running cycle
    const amp = Math.min(speed * 0.6, 0.85);
    if (limbs.leftLeg) limbs.leftLeg.rotation.x = walkCycle * amp;
    if (limbs.rightLeg) limbs.rightLeg.rotation.x = -walkCycle * amp;

    if (!isAttacking) {
      if (limbs.leftArm) limbs.leftArm.rotation.x = -walkCycle * amp * 0.9;
      if (limbs.rightArm) limbs.rightArm.rotation.x = walkCycle * amp * 0.9;
    }

    // Pou hopping bounce
    if (characterId === 'pou' && limbs.body) {
      limbs.body.position.y = 0.55 + Math.abs(Math.sin(time * 11)) * 0.12;
    }
  } else {
    // Idle breathing
    const breath = Math.sin(time * 2.5) * 0.03;
    if (limbs.leftLeg) limbs.leftLeg.rotation.x = 0;
    if (limbs.rightLeg) limbs.rightLeg.rotation.x = 0;

    if (!isAttacking) {
      if (limbs.leftArm) limbs.leftArm.rotation.set(breath, 0, breath * 0.5);
      if (limbs.rightArm) limbs.rightArm.rotation.set(-breath, 0, -breath * 0.5);
    }
    if (limbs.head) limbs.head.rotation.y = Math.sin(time * 1.2) * 0.1;
  }

  // Combat Attack Swing / Punch
  if (isAttacking && limbs.rightArm) {
    // Swing arc: raise back (0-0.3), heavy forward slash (0.3-0.7), recovery (0.7-1.0)
    if (attackProgress < 0.3) {
      const p = attackProgress / 0.3;
      limbs.rightArm.rotation.x = -Math.PI * 0.6 * p;
      limbs.rightArm.rotation.y = Math.PI * 0.3 * p;
      limbs.rightArm.rotation.z = Math.PI * 0.2 * p;
    } else if (attackProgress < 0.7) {
      const p = (attackProgress - 0.3) / 0.4;
      limbs.rightArm.rotation.x = -Math.PI * 0.6 + Math.PI * 1.3 * p;
      limbs.rightArm.rotation.y = Math.PI * 0.3 - Math.PI * 0.7 * p;
      limbs.rightArm.rotation.z = Math.PI * 0.2 - Math.PI * 0.4 * p;
    } else {
      const p = (attackProgress - 0.7) / 0.3;
      limbs.rightArm.rotation.x = Math.PI * 0.7 * (1 - p);
      limbs.rightArm.rotation.y = -Math.PI * 0.4 * (1 - p);
      limbs.rightArm.rotation.z = -Math.PI * 0.2 * (1 - p);
    }

    // Left arm balances combat posture
    if (limbs.leftArm) {
      limbs.leftArm.rotation.set(0.3, 0.2, 0.4);
    }
  }
}
