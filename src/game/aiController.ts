import * as THREE from 'three';
import { FighterEntity, WeaponPickup } from './types';
import { WEAPONS, STADIUM_BOUNDARY_RADIUS } from './constants';

const _botDir = new THREE.Vector3();
const _targetDir = new THREE.Vector3();

/**
 * Updates AI behavior for computer-controlled fighters
 */
export function updateBotAI(
  bot: FighterEntity,
  allFighters: FighterEntity[],
  pickups: WeaponPickup[],
  delta: number,
  time: number,
  onBotAttack: (bot: FighterEntity) => void,
  onBotPickup: (bot: FighterEntity, pickup: WeaponPickup) => void
) {
  if (bot.isDead) return;

  // Initialize AI fields if not set
  if (!bot.aiState) bot.aiState = 'patrol';
  bot.aiChangeTargetTimer = (bot.aiChangeTargetTimer || 0) - delta;

  // 1. Pick or re-evaluate target if timer expired or target dead
  if (bot.aiChangeTargetTimer <= 0 || !bot.aiTargetId) {
    bot.aiChangeTargetTimer = 2.5 + Math.random() * 2.0;

    // Check if we should prioritize getting a weapon
    const isUnarmed = bot.equippedWeapon === 'fists';
    const availablePickups = pickups.filter((p) => p.active);

    if (isUnarmed && availablePickups.length > 0) {
      // Find closest weapon
      let closestPickup: WeaponPickup | null = null;
      let minPickupDist = Infinity;
      availablePickups.forEach((p) => {
        const d = bot.position.distanceTo(p.position);
        if (d < minPickupDist) {
          minPickupDist = d;
          closestPickup = p;
        }
      });

      if (closestPickup && minPickupDist < 45) {
        bot.aiState = 'seek_weapon';
        bot.aiTargetId = (closestPickup as WeaponPickup).id;
      }
    }

    if (bot.aiState !== 'seek_weapon') {
      // Find enemy to fight (either player or other bot)
      let closestEnemy: FighterEntity | null = null;
      let minEnemyDist = Infinity;

      allFighters.forEach((other) => {
        if (other.id === bot.id || other.isDead) return;
        const d = bot.position.distanceTo(other.position);
        if (d < minEnemyDist) {
          minEnemyDist = d;
          closestEnemy = other;
        }
      });

      if (closestEnemy) {
        bot.aiTargetId = (closestEnemy as FighterEntity).id;
        bot.aiState = bot.health < 25 ? 'retreat' : 'chase';
      } else {
        bot.aiState = 'patrol';
      }
    }
  }

  // 2. Execute current AI state
  const weaponDef = WEAPONS[bot.equippedWeapon] || WEAPONS.fists;
  const attackRange = weaponDef.range;

  if (bot.aiState === 'seek_weapon') {
    const targetPickup = pickups.find((p) => p.id === bot.aiTargetId && p.active);
    if (!targetPickup) {
      bot.aiChangeTargetTimer = 0; // Trigger retarget
      return;
    }

    const dist = bot.position.distanceTo(targetPickup.position);
    if (dist < 2.0) {
      // Pickup the weapon!
      onBotPickup(bot, targetPickup);
      bot.aiChangeTargetTimer = 0; // Target an enemy now
      return;
    }

    // Move toward weapon
    _botDir.subVectors(targetPickup.position, bot.position);
    _botDir.y = 0;
    _botDir.normalize();

    const speed = 7.5;
    bot.velocity.x = _botDir.x * speed;
    bot.velocity.z = _botDir.z * speed;
    bot.targetRotationY = Math.atan2(_botDir.x, _botDir.z);

  } else if (bot.aiState === 'chase' || bot.aiState === 'attack') {
    const enemy = allFighters.find((f) => f.id === bot.aiTargetId && !f.isDead);
    if (!enemy) {
      bot.aiChangeTargetTimer = 0;
      return;
    }

    const dist = bot.position.distanceTo(enemy.position);

    _targetDir.subVectors(enemy.position, bot.position);
    _targetDir.y = 0;
    _targetDir.normalize();
    bot.targetRotationY = Math.atan2(_targetDir.x, _targetDir.z);

    if (dist <= attackRange * 1.1) {
      // In attack range!
      bot.aiState = 'attack';
      bot.velocity.x *= 0.6;
      bot.velocity.z *= 0.6;

      // Attack if cooldown ready
      if (bot.attackCooldown <= 0 && !bot.isAttacking) {
        onBotAttack(bot);
      }
    } else {
      // Chase enemy
      bot.aiState = 'chase';
      const speed = 7.0;
      bot.velocity.x = _targetDir.x * speed;
      bot.velocity.z = _targetDir.z * speed;

      // Random strafe / circle around target
      if (dist < 8 && Math.sin(time + bot.animTimer) > 0.4) {
        bot.velocity.x += -_targetDir.z * 3.5;
        bot.velocity.z += _targetDir.x * 3.5;
      }
    }

  } else if (bot.aiState === 'retreat') {
    // Flee away from nearest enemy to allow health regeneration
    const enemy = allFighters.find((f) => f.id === bot.aiTargetId && !f.isDead);
    if (enemy) {
      _targetDir.subVectors(bot.position, enemy.position);
      _targetDir.y = 0;
      _targetDir.normalize();

      const speed = 8.5;
      bot.velocity.x = _targetDir.x * speed;
      bot.velocity.z = _targetDir.z * speed;
      bot.targetRotationY = Math.atan2(_targetDir.x, _targetDir.z);

      if (bot.health > 70) {
        bot.aiChangeTargetTimer = 0; // Return to fight once healed
      }
    }
  } else {
    // Patrol / Wander around diamond
    bot.velocity.x = Math.sin(time * 0.5 + parseFloat(bot.id.slice(-2) || '0')) * 3.0;
    bot.velocity.z = Math.cos(time * 0.5 + parseFloat(bot.id.slice(-2) || '0')) * 3.0;
    bot.targetRotationY = Math.atan2(bot.velocity.x, bot.velocity.z);
  }

  // Constrain bots within stadium boundary
  const distFromCenter = Math.hypot(bot.position.x, bot.position.z);
  if (distFromCenter > STADIUM_BOUNDARY_RADIUS - 3) {
    const angle = Math.atan2(bot.position.z, bot.position.x);
    bot.position.x = Math.cos(angle) * (STADIUM_BOUNDARY_RADIUS - 3.5);
    bot.position.z = Math.sin(angle) * (STADIUM_BOUNDARY_RADIUS - 3.5);
    bot.velocity.x *= -0.5;
    bot.velocity.z *= -0.5;
  }
}
