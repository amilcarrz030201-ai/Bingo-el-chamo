import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterId,
  FighterEntity,
  WeaponType,
  WeaponPickup,
  FloatingDamage,
  KillfeedEntry,
  GameSettings,
} from './types';
import {
  CHARACTERS,
  WEAPONS,
  REGEN_DELAY_SECONDS,
  REGEN_RATE_PER_SECOND,
  BOT_RESPAWN_DELAY_SECONDS,
  WEAPON_RESPAWN_DELAY_SECONDS,
  STADIUM_BOUNDARY_RADIUS,
} from './constants';
import { createCharacterModel, animateCharacterLimbs } from './characterModels';
import { createWeaponMesh, createPickupMarker } from './weaponModels';
import { buildBaseballStadium } from './baseballStadium';
import { updateBotAI } from './aiController';
import { sounds } from './soundEffects';

// Pre-allocated math objects to avoid GC in animation loop
const _tempVecA = new THREE.Vector3();
const _tempVecB = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export interface BattleEngineCallbacks {
  onPlayerStatsChange: (health: number, armor: number, weapon: WeaponType, kills: number, isRegenerating: boolean) => void;
  onKillfeed: (entry: KillfeedEntry) => void;
  onDamageFloat: (damage: FloatingDamage) => void;
  onNearPickupChange: (pickup: WeaponPickup | null) => void;
  onGameOver: (isVictory: boolean, stats: { kills: number; timeAlive: number }) => void;
}

export class BattleEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private callbacks: BattleEngineCallbacks;

  // Software WebGL guard
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private isRunning: boolean = false;

  // Game Entities
  public player: FighterEntity | null = null;
  public bots: FighterEntity[] = [];
  public pickups: WeaponPickup[] = [];
  private damageFloats: FloatingDamage[] = [];
  private arenaSpawnPoints: THREE.Vector3[] = [];
  private arenaWeaponSpawns: { position: THREE.Vector3; suggestedWeapon: string }[] = [];

  // Third-person camera controls
  private cameraYaw: number = 0;
  private cameraPitch: number = 0.28;
  private cameraDistance: number = 5.5;
  private minPitch: number = -0.15;
  private maxPitch: number = 1.15;
  private isDraggingCamera: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  // Player input state
  public input = {
    forward: 0,
    right: 0,
    jump: false,
    attack: false,
    pickup: false,
  };

  // Match state
  public matchTime: number = 0;
  public playerKills: number = 0;
  public isPlayerDead: boolean = false;
  public selectedCharacterId: CharacterId = 'cj';
  public settings: GameSettings = {
    soundEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    showMinimap: true,
    cameraSensitivity: 1.0,
    botCount: 5,
  };

  private nearestPickupToPlayer: WeaponPickup | null = null;

  constructor(container: HTMLElement, characterId: CharacterId, callbacks: BattleEngineCallbacks) {
    this.container = container;
    this.selectedCharacterId = characterId;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Initialize Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Horizon Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Clear sky blue
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.007); // Soft horizon fog

    // 4. Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 400);

    // 5. Studio Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-point lighting rig (Key light + fill + hemisphere)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    keyLight.position.set(40, 60, 30);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 160;
    const d = 50;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e3a1e, 0.65);
    this.scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    rimLight.position.set(-35, 40, -45);
    this.scene.add(rimLight);

    // 6. Build Baseball Stadium Arena Map
    const stadiumData = buildBaseballStadium();
    this.scene.add(stadiumData.group);
    this.arenaSpawnPoints = stadiumData.spawnPoints;
    this.arenaWeaponSpawns = stadiumData.weaponSpawnPoints;

    // 7. Initialize Pickups & Fighters
    this.initWeaponPickups();
    this.initFighters();

    // 8. Event Listeners
    this.bindEvents();

    // Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Start render loop
    this.isRunning = true;
    this.tick = this.tick.bind(this);
    this.tick();
  }

  // Bind keyboard, mouse, and pointer events
  private bindEvents() {
    window.addEventListener('resize', this.onWindowResize);

    const canvas = this.renderer.domElement;

    // Pointer events for third-person camera rotation
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });

    // Keyboard controls
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  public unbindEvents() {
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerDown = (e: PointerEvent) => {
    // Only capture if clicking the 3D canvas
    this.isDraggingCamera = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    sounds.ensureContext();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDraggingCamera) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    const sens = 0.0055 * this.settings.cameraSensitivity;
    this.cameraYaw -= dx * sens;
    this.cameraPitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.cameraPitch + dy * sens));
  };

  private onPointerUp = () => {
    this.isDraggingCamera = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.cameraDistance = Math.max(2.8, Math.min(10.0, this.cameraDistance + e.deltaY * 0.005));
  };

  private onKeyDown = (e: KeyboardEvent) => {
    sounds.ensureContext();
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = 1;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.forward = -1;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.right = -1;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = 1;
        break;
      case 'Space':
        this.input.jump = true;
        break;
      case 'KeyE':
        this.triggerPlayerPickup();
        break;
      case 'KeyF':
        this.triggerPlayerAttack();
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        if (this.input.forward === 1) this.input.forward = 0;
        break;
      case 'KeyS':
      case 'ArrowDown':
        if (this.input.forward === -1) this.input.forward = 0;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        if (this.input.right === -1) this.input.right = 0;
        break;
      case 'KeyD':
      case 'ArrowRight':
        if (this.input.right === 1) this.input.right = 0;
        break;
      case 'Space':
        this.input.jump = false;
        break;
    }
  };

  // Initialize scattered weapon pickups in the baseball stadium
  private initWeaponPickups() {
    this.arenaWeaponSpawns.forEach((spawn, idx) => {
      const type = spawn.suggestedWeapon as WeaponType;
      const marker = createPickupMarker(type, spawn.position);
      this.scene.add(marker.group);

      this.pickups.push({
        id: `pickup_${idx}_${type}`,
        type,
        position: spawn.position.clone(),
        mesh: marker.group,
        glowMesh: marker.ringMesh,
        respawnTimer: 0,
        active: true,
      });
    });
  }

  // Create the player and computer-controlled bots
  private initFighters() {
    // 1. Create Human Player
    const playerDef = CHARACTERS[this.selectedCharacterId] || CHARACTERS.cj;
    const playerModel = createCharacterModel(this.selectedCharacterId);
    this.scene.add(playerModel.group);

    const spawnPos = this.arenaSpawnPoints[0] || new THREE.Vector3(0, 0, 3);
    playerModel.group.position.copy(spawnPos);

    this.player = {
      id: 'player_human',
      name: playerDef.name,
      characterId: this.selectedCharacterId,
      isBot: false,
      mesh: playerModel.group,
      position: spawnPos.clone(),
      velocity: new THREE.Vector3(),
      rotationY: 0,
      targetRotationY: 0,
      isGrounded: true,
      health: playerDef.baseHealth,
      maxHealth: playerDef.baseHealth,
      armor: playerDef.baseArmor,
      maxArmor: playerDef.baseArmor,
      lastDamageTime: -999,
      isRegenerating: false,
      isDead: false,
      deathTime: 0,
      kills: 0,
      score: 0,
      equippedWeapon: 'fists',
      weaponMeshSlot: null,
      attackCooldown: 0,
      isAttacking: false,
      attackProgress: 0,
      animTimer: 0,
      limbs: playerModel.limbs,
    };

    // 2. Spawn Computer Bots (Pou, CJ, Perro, Boxer, Alien, etc.)
    const botArchetypes: { charId: CharacterId; name: string }[] = [
      { charId: 'pou', name: 'Pou El Travieso' },
      { charId: 'perro', name: 'Firulais Bravo' },
      { charId: 'cj', name: 'CJ San Andreas' },
      { charId: 'boxer', name: 'El Boxeador Rocky' },
      { charId: 'alien', name: 'Marcianito 100% Real' },
    ];

    // Filter out whichever character the player selected to keep variety high
    const availableArchetypes = botArchetypes.filter((b) => b.charId !== this.selectedCharacterId);

    const botCount = Math.min(this.settings.botCount, this.arenaSpawnPoints.length - 1);
    for (let i = 0; i < botCount; i++) {
      const arch = availableArchetypes[i % availableArchetypes.length];
      const model = createCharacterModel(arch.charId);
      this.scene.add(model.group);

      const spawn = this.arenaSpawnPoints[i + 1] || new THREE.Vector3(10 + i * 5, 0, 10 + i * 5);
      model.group.position.copy(spawn);

      const charDef = CHARACTERS[arch.charId];
      const bot: FighterEntity = {
        id: `bot_${i}_${arch.charId}`,
        name: arch.name,
        characterId: arch.charId,
        isBot: true,
        mesh: model.group,
        position: spawn.clone(),
        velocity: new THREE.Vector3(),
        rotationY: Math.random() * Math.PI * 2,
        targetRotationY: 0,
        isGrounded: true,
        health: charDef.baseHealth,
        maxHealth: charDef.baseHealth,
        armor: charDef.baseArmor,
        maxArmor: charDef.baseArmor,
        lastDamageTime: -999,
        isRegenerating: false,
        isDead: false,
        deathTime: 0,
        kills: 0,
        score: 0,
        equippedWeapon: 'fists',
        weaponMeshSlot: null,
        attackCooldown: 0,
        isAttacking: false,
        attackProgress: 0,
        animTimer: Math.random() * 10,
        limbs: model.limbs,
        aiState: 'patrol',
        aiChangeTargetTimer: 1.0 + Math.random() * 2,
      };

      this.bots.push(bot);
    }
  }

  // Attach weapon mesh to fighter's hand or dog's mouth
  private equipFighterWeapon(fighter: FighterEntity, weaponType: WeaponType) {
    fighter.equippedWeapon = weaponType;

    // Remove existing weapon mesh in socket
    if (fighter.weaponMeshSlot) {
      if (fighter.limbs.weaponSocket) {
        fighter.limbs.weaponSocket.remove(fighter.weaponMeshSlot);
      }
      fighter.weaponMeshSlot = null;
    }

    if (weaponType === 'fists') return;

    // Create new weapon mesh
    const wMesh = createWeaponMesh(weaponType);
    if (fighter.characterId === 'perro' && fighter.limbs.mouthSocket) {
      // Rotate weapon horizontally to fit in dog's mouth
      wMesh.rotation.set(Math.PI / 2, 0, Math.PI / 2);
      wMesh.position.set(0, 0, 0.15);
      wMesh.scale.set(0.85, 0.85, 0.85);
      fighter.limbs.mouthSocket.add(wMesh);
    } else if (fighter.limbs.weaponSocket) {
      // Fit in right hand
      wMesh.rotation.set(0, 0, 0);
      wMesh.position.set(0, 0, 0);
      fighter.limbs.weaponSocket.add(wMesh);
    }

    fighter.weaponMeshSlot = wMesh;
  }

  // Trigger weapon pickup for player
  public triggerPlayerPickup() {
    if (!this.player || this.player.isDead || !this.nearestPickupToPlayer) return;
    const pickup = this.nearestPickupToPlayer;

    sounds.playPickup();
    this.equipFighterWeapon(this.player, pickup.type);

    // Disable pickup and start respawn timer
    pickup.active = false;
    pickup.mesh.visible = false;
    pickup.respawnTimer = WEAPON_RESPAWN_DELAY_SECONDS;
    this.nearestPickupToPlayer = null;
    this.callbacks.onNearPickupChange(null);

    // Update stats UI
    this.callbacks.onPlayerStatsChange(
      this.player.health,
      this.player.armor,
      this.player.equippedWeapon,
      this.player.kills,
      this.player.isRegenerating
    );
  }

  // Player triggers melee attack / swing
  public triggerPlayerAttack() {
    if (!this.player || this.player.isDead || this.player.attackCooldown > 0 || this.player.isAttacking) {
      return;
    }

    this.player.isAttacking = true;
    this.player.attackProgress = 0;
    const weaponDef = WEAPONS[this.player.equippedWeapon] || WEAPONS.fists;
    this.player.attackCooldown = weaponDef.swingSpeed;

    sounds.playSwing(this.player.equippedWeapon);
  }

  // Perform combat attack check at the apex of the swing animation
  private executeAttackHitCheck(attacker: FighterEntity) {
    const weaponDef = WEAPONS[attacker.equippedWeapon] || WEAPONS.fists;
    const charDef = CHARACTERS[attacker.characterId] || CHARACTERS.cj;
    const attackRange = weaponDef.range;

    // Attacker forward direction vector
    _tempVecA.set(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), attacker.rotationY);

    const allTargets = [this.player, ...this.bots].filter((f): f is FighterEntity => f !== null && f.id !== attacker.id && !f.isDead);

    allTargets.forEach((target) => {
      _tempVecB.subVectors(target.position, attacker.position);
      const dist = _tempVecB.length();
      if (dist > attackRange + 0.3) return;

      // Check if target is roughly in front (angle < ~75 degrees)
      _tempVecB.normalize();
      const dot = _tempVecA.dot(_tempVecB);
      if (dot < 0.25) return; // Behind attacker

      // HIT CONNECTED!
      const isCrit = Math.random() < 0.22;
      const baseDmg = weaponDef.damage * charDef.baseDamage;
      const rawDamage = Math.round(isCrit ? baseDmg * 1.5 : baseDmg);

      this.applyDamageToFighter(target, rawDamage, attacker, isCrit);

      // Play impact audio
      sounds.playHit(attacker.equippedWeapon, isCrit);

      // Push target backwards slightly (knockback)
      const pushForce = isCrit ? 6.5 : 4.0;
      target.velocity.x += _tempVecB.x * pushForce;
      target.velocity.z += _tempVecB.z * pushForce;
    });
  }

  // Apply damage: absorbs with Armor (Chaleco) first, then Health (Vida)
  private applyDamageToFighter(victim: FighterEntity, damageAmount: number, attacker: FighterEntity, isCrit: boolean) {
    victim.lastDamageTime = this.matchTime;
    victim.isRegenerating = false;

    let remainingDamage = damageAmount;

    // Armor absorption (Chaleco blindado)
    if (victim.armor > 0) {
      if (victim.armor >= remainingDamage) {
        victim.armor -= remainingDamage;
        remainingDamage = 0;
        sounds.playArmorHit();
      } else {
        remainingDamage -= victim.armor;
        victim.armor = 0;
        sounds.playArmorHit();
      }
    }

    // Health damage (Vida)
    if (remainingDamage > 0) {
      victim.health = Math.max(0, victim.health - remainingDamage);
    }

    // Floating damage text
    const floatPos = victim.position.clone().add(new THREE.Vector3(0, 1.8, 0));
    const floatEntry: FloatingDamage = {
      id: `dmg_${Date.now()}_${Math.random()}`,
      text: isCrit ? `-${damageAmount} CRÍTICO!` : `-${damageAmount}`,
      position: floatPos,
      color: isCrit ? '#ef4444' : '#f59e0b',
      scale: isCrit ? 1.4 : 1.0,
      life: 1.0,
      isCrit,
    };
    this.damageFloats.push(floatEntry);
    this.callbacks.onDamageFloat(floatEntry);

    // Victim death check
    if (victim.health <= 0 && !victim.isDead) {
      this.handleFighterDeath(victim, attacker);
    }

    // If player took damage, notify UI
    if (victim.id === this.player?.id) {
      this.callbacks.onPlayerStatsChange(
        victim.health,
        victim.armor,
        victim.equippedWeapon,
        victim.kills,
        victim.isRegenerating
      );
    }
  }

  // Handle fighter knockout / death
  private handleFighterDeath(victim: FighterEntity, killer: FighterEntity) {
    victim.isDead = true;
    victim.deathTime = this.matchTime;
    victim.velocity.set(0, 0, 0);

    killer.kills++;
    killer.score += 100;

    sounds.playKO();

    // Killfeed entry
    const killerWeapon = WEAPONS[killer.equippedWeapon]?.name || 'Puños Limpios';
    const entry: KillfeedEntry = {
      id: `kf_${Date.now()}_${Math.random()}`,
      killer: killer.name,
      victim: victim.name,
      weapon: killerWeapon,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    this.callbacks.onKillfeed(entry);

    if (killer.id === this.player?.id) {
      this.playerKills++;
    }

    if (victim.id === this.player?.id) {
      this.isPlayerDead = true;
      this.callbacks.onGameOver(false, { kills: this.playerKills, timeAlive: Math.round(this.matchTime) });
    }
  }

  // Respawn a bot at a random arena spawn point
  private respawnBot(bot: FighterEntity) {
    const randomSpawn = this.arenaSpawnPoints[Math.floor(Math.random() * this.arenaSpawnPoints.length)];
    bot.position.copy(randomSpawn);
    bot.velocity.set(0, 0, 0);
    bot.health = bot.maxHealth;
    bot.armor = bot.maxArmor;
    bot.isDead = false;
    bot.isRegenerating = false;
    bot.lastDamageTime = this.matchTime;
    this.equipFighterWeapon(bot, 'fists');
  }

  // Player manual respawn / restart
  public restartMatch(newCharId?: CharacterId) {
    if (newCharId) {
      this.selectedCharacterId = newCharId;
    }

    // Clean up meshes
    if (this.player) {
      this.scene.remove(this.player.mesh);
    }
    this.bots.forEach((b) => this.scene.remove(b.mesh));
    this.bots = [];

    this.playerKills = 0;
    this.matchTime = 0;
    this.isPlayerDead = false;

    this.initFighters();

    if (this.player) {
      this.callbacks.onPlayerStatsChange(
        this.player.health,
        this.player.armor,
        this.player.equippedWeapon,
        this.player.kills,
        this.player.isRegenerating
      );
    }
  }

  // Software WebGL pacing helper
  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  // Main game tick
  private tick = () => {
    if (!this.isRunning) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.matchTime += delta;

    this.updateGame(delta);
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  // Update physics, input, animation, AI, and health regeneration
  private updateGame(delta: number) {
    // 1. Update Weapon Pickups (rotation & bobbing)
    this.pickups.forEach((pickup) => {
      if (pickup.active) {
        pickup.mesh.rotation.y += delta * 1.8;
        const bob = Math.sin(this.matchTime * 3.0) * 0.12;
        pickup.mesh.position.y = pickup.position.y + bob;
      } else {
        pickup.respawnTimer -= delta;
        if (pickup.respawnTimer <= 0) {
          pickup.active = true;
          pickup.mesh.visible = true;
        }
      }
    });

    // 2. Update Player Kinematics
    if (this.player && !this.player.isDead) {
      this.updatePlayerMovement(delta);
      this.updateFighterCombat(this.player, delta);
      this.updateHealthRegeneration(this.player, delta);
    }

    // 3. Check Nearest Pickup to Player for UI prompt
    if (this.player && !this.player.isDead) {
      let nearest: WeaponPickup | null = null;
      let minD = 2.4;
      this.pickups.forEach((p) => {
        if (!p.active) return;
        const d = this.player!.position.distanceTo(p.position);
        if (d < minD) {
          minD = d;
          nearest = p;
        }
      });

      if (nearest !== this.nearestPickupToPlayer) {
        this.nearestPickupToPlayer = nearest;
        this.callbacks.onNearPickupChange(nearest);
      }
    }

    // 4. Update Bots (AI, movement, combat, regeneration, respawn)
    const allFighters = [this.player, ...this.bots].filter((f): f is FighterEntity => f !== null);

    this.bots.forEach((bot) => {
      if (bot.isDead) {
        if (this.matchTime - bot.deathTime > BOT_RESPAWN_DELAY_SECONDS) {
          this.respawnBot(bot);
        }
        return;
      }

      // Run AI logic
      updateBotAI(
        bot,
        allFighters,
        this.pickups,
        delta,
        this.matchTime,
        (attackingBot) => {
          if (attackingBot.attackCooldown <= 0 && !attackingBot.isAttacking) {
            attackingBot.isAttacking = true;
            attackingBot.attackProgress = 0;
            const wDef = WEAPONS[attackingBot.equippedWeapon] || WEAPONS.fists;
            attackingBot.attackCooldown = wDef.swingSpeed;
            sounds.playSwing(attackingBot.equippedWeapon);
          }
        },
        (pickupBot, pickup) => {
          this.equipFighterWeapon(pickupBot, pickup.type);
          pickup.active = false;
          pickup.mesh.visible = false;
          pickup.respawnTimer = WEAPON_RESPAWN_DELAY_SECONDS;
        }
      );

      // Move bot by velocity
      bot.position.x += bot.velocity.x * delta;
      bot.position.z += bot.velocity.z * delta;

      // Rotate toward target direction smoothly
      let rotDiff = bot.targetRotationY - bot.rotationY;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      bot.rotationY += rotDiff * Math.min(1.0, delta * 9.0);
      bot.mesh.rotation.y = bot.rotationY;
      bot.mesh.position.copy(bot.position);

      this.updateFighterCombat(bot, delta);
      this.updateHealthRegeneration(bot, delta);

      // Animate bot limbs
      const botSpeed = Math.hypot(bot.velocity.x, bot.velocity.z);
      bot.animTimer += delta;
      animateCharacterLimbs(
        bot.characterId,
        bot.limbs,
        botSpeed,
        bot.animTimer,
        bot.isAttacking,
        bot.attackProgress,
        bot.isGrounded,
        bot.isDead
      );
    });

    // 5. Update Third-Person Camera Tracking
    this.updateThirdPersonCamera(delta);
  }

  // Player movement relative to third-person camera direction
  private updatePlayerMovement(delta: number) {
    if (!this.player) return;

    const charDef = CHARACTERS[this.player.characterId] || CHARACTERS.cj;
    const baseSpeed = 9.5 * charDef.baseSpeed;

    // Movement vector relative to camera yaw
    const forwardX = -Math.sin(this.cameraYaw);
    const forwardZ = -Math.cos(this.cameraYaw);
    const rightX = -forwardZ;
    const rightZ = forwardX;

    const moveX = forwardX * this.input.forward + rightX * this.input.right;
    const moveZ = forwardZ * this.input.forward + rightZ * this.input.right;
    const moveLen = Math.hypot(moveX, moveZ);

    if (moveLen > 0.05) {
      const normX = moveX / moveLen;
      const normZ = moveZ / moveLen;
      this.player.velocity.x = normX * baseSpeed;
      this.player.velocity.z = normZ * baseSpeed;

      // Face direction of movement
      this.player.targetRotationY = Math.atan2(normX, normZ);
      let diff = this.player.targetRotationY - this.player.rotationY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.player.rotationY += diff * Math.min(1.0, delta * 14.0);
    } else {
      this.player.velocity.x *= 0.6;
      this.player.velocity.z *= 0.6;
    }

    // Jump handling
    if (this.input.jump && this.player.isGrounded) {
      this.player.velocity.y = 8.5;
      this.player.isGrounded = false;
      sounds.playJump();
    }

    // Gravity
    if (!this.player.isGrounded) {
      this.player.velocity.y -= 22 * delta;
    }

    // Apply movement
    this.player.position.x += this.player.velocity.x * delta;
    this.player.position.y += this.player.velocity.y * delta;
    this.player.position.z += this.player.velocity.z * delta;

    // Ground clamp (baseball field elevation)
    const groundY = 0;
    if (this.player.position.y <= groundY) {
      this.player.position.y = groundY;
      this.player.velocity.y = 0;
      this.player.isGrounded = true;
    }

    // Stadium boundary constraint
    const r = Math.hypot(this.player.position.x, this.player.position.z);
    if (r > STADIUM_BOUNDARY_RADIUS - 2) {
      const angle = Math.atan2(this.player.position.z, this.player.position.x);
      this.player.position.x = Math.cos(angle) * (STADIUM_BOUNDARY_RADIUS - 2.2);
      this.player.position.z = Math.sin(angle) * (STADIUM_BOUNDARY_RADIUS - 2.2);
    }

    this.player.mesh.position.copy(this.player.position);
    this.player.mesh.rotation.y = this.player.rotationY;

    // Animate limbs
    const speed = Math.hypot(this.player.velocity.x, this.player.velocity.z);
    this.player.animTimer += delta;
    animateCharacterLimbs(
      this.player.characterId,
      this.player.limbs,
      speed,
      this.player.animTimer,
      this.player.isAttacking,
      this.player.attackProgress,
      this.player.isGrounded,
      this.player.isDead
    );
  }

  // Update fighter combat swing progress & hitbox check
  private updateFighterCombat(fighter: FighterEntity, delta: number) {
    if (fighter.attackCooldown > 0) {
      fighter.attackCooldown -= delta;
    }

    if (fighter.isAttacking) {
      const weaponDef = WEAPONS[fighter.equippedWeapon] || WEAPONS.fists;
      const swingDuration = weaponDef.swingSpeed;
      fighter.attackProgress += delta / swingDuration;

      // Trigger hit check at peak of swing (approx 45% progress)
      if (fighter.attackProgress >= 0.45 && fighter.attackProgress - (delta / swingDuration) < 0.45) {
        this.executeAttackHitCheck(fighter);
      }

      if (fighter.attackProgress >= 1.0) {
        fighter.isAttacking = false;
        fighter.attackProgress = 0;
      }
    }
  }

  // Health Regeneration ("se regenera la vida al rato"):
  // If not taking damage for REGEN_DELAY_SECONDS (4s), regenerates health smoothly
  private updateHealthRegeneration(fighter: FighterEntity, delta: number) {
    if (fighter.isDead) return;

    const timeSinceDamage = this.matchTime - fighter.lastDamageTime;
    if (timeSinceDamage >= REGEN_DELAY_SECONDS && fighter.health < fighter.maxHealth) {
      const prevHealth = fighter.health;
      fighter.health = Math.min(fighter.maxHealth, fighter.health + REGEN_RATE_PER_SECOND * delta);
      fighter.isRegenerating = true;

      // Trigger soft regen sound pulse occasionally
      if (fighter.id === this.player?.id && Math.floor(fighter.health / 20) > Math.floor(prevHealth / 20)) {
        sounds.playRegenPulse();
      }

      if (fighter.id === this.player?.id) {
        this.callbacks.onPlayerStatsChange(
          fighter.health,
          fighter.armor,
          fighter.equippedWeapon,
          fighter.kills,
          true
        );
      }
    } else if (fighter.isRegenerating && (fighter.health >= fighter.maxHealth || timeSinceDamage < REGEN_DELAY_SECONDS)) {
      fighter.isRegenerating = false;
      if (fighter.id === this.player?.id) {
        this.callbacks.onPlayerStatsChange(
          fighter.health,
          fighter.armor,
          fighter.equippedWeapon,
          fighter.kills,
          false
        );
      }
    }
  }

  // Smooth Third-Person Camera tracking following the player
  private updateThirdPersonCamera(delta: number) {
    const target = this.player ? this.player.position : new THREE.Vector3(0, 1.2, 0);

    // Camera look target (player chest height)
    _lookTarget.set(target.x, target.y + 1.45, target.z);

    // Calculate spherical orbit position
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const sinYaw = Math.sin(this.cameraYaw);
    const cosYaw = Math.cos(this.cameraYaw);

    _camOffset.set(
      sinYaw * cosPitch * this.cameraDistance,
      sinPitch * this.cameraDistance,
      cosYaw * cosPitch * this.cameraDistance
    );

    const desiredCamPos = _tempVecA.copy(_lookTarget).add(_camOffset);

    // Prevent camera from clipping through ground
    if (desiredCamPos.y < 0.45) {
      desiredCamPos.y = 0.45;
    }

    // Smooth exponential damping interpolation
    const dampRate = Math.min(1.0, delta * 16.0);
    this.camera.position.lerp(desiredCamPos, dampRate);
    this.camera.lookAt(_lookTarget);
  }

  // Clean disposal
  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.unbindEvents();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
