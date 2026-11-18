import * as THREE from 'three';

export type CharacterId = 'cj' | 'pou' | 'perro' | 'boxer' | 'alien';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  subtitle: string;
  description: string;
  baseSpeed: number; // movement speed multiplier
  baseDamage: number; // melee power bonus
  baseHealth: number;
  baseArmor: number;
  avatarColor: string;
  tagline: string;
  iconEmoji: string;
}

export type WeaponType = 'fists' | 'palo' | 'cepillo' | 'pala' | 'bate' | 'tuberia';

export interface WeaponDef {
  type: WeaponType;
  name: string;
  damage: number;
  range: number;
  swingSpeed: number; // in seconds per swing
  color: string;
  description: string;
  icon: string;
}

export interface WeaponPickup {
  id: string;
  type: WeaponType;
  position: THREE.Vector3;
  mesh: THREE.Group;
  glowMesh: THREE.Mesh;
  respawnTimer: number; // 0 if available, >0 counts down to respawn
  active: boolean;
}

export interface FighterEntity {
  id: string;
  name: string;
  characterId: CharacterId;
  isBot: boolean;
  mesh: THREE.Group;
  
  // Position & movement
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationY: number;
  targetRotationY: number;
  isGrounded: boolean;
  
  // Combat stats
  health: number;
  maxHealth: number;
  armor: number; // Chaleco blindado
  maxArmor: number;
  lastDamageTime: number; // timestamp in seconds
  isRegenerating: boolean;
  isDead: boolean;
  deathTime: number;
  kills: number;
  score: number;
  
  // Weapon
  equippedWeapon: WeaponType;
  weaponMeshSlot: THREE.Group | null;
  attackCooldown: number;
  isAttacking: boolean;
  attackProgress: number; // 0 to 1
  
  // Animation state
  animTimer: number;
  limbs: CharacterLimbs;
  
  // AI specific
  aiTargetId?: string;
  aiState?: 'patrol' | 'seek_weapon' | 'chase' | 'attack' | 'retreat';
  aiChangeTargetTimer?: number;
}

export interface CharacterLimbs {
  head?: THREE.Object3D;
  body?: THREE.Object3D;
  leftArm?: THREE.Object3D;
  rightArm?: THREE.Object3D;
  leftLeg?: THREE.Object3D;
  rightLeg?: THREE.Object3D;
  leftForearm?: THREE.Object3D;
  rightForearm?: THREE.Object3D;
  tail?: THREE.Object3D; // For dog
  ears?: THREE.Object3D[]; // For dog/pou
  weaponSocket?: THREE.Object3D;
  mouthSocket?: THREE.Object3D; // For dog holding weapon
}

export interface FloatingDamage {
  id: string;
  text: string;
  position: THREE.Vector3;
  color: string;
  scale: number;
  life: number; // 0 to 1
  isCrit?: boolean;
}

export interface KillfeedEntry {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  time: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  showMinimap: boolean;
  cameraSensitivity: number;
  botCount: number;
}
