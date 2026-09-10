import * as Phaser from 'phaser';
import { Actor } from './Actor';
import { AttackAbility } from '../abilities/AttackAbility';
import { AutoAimAbility } from '../abilities/AutoAimAbility';
import { DeathAbility } from '../abilities/DeathAbility';
import { HitAbility } from '../abilities/HitAbility';
import { MovementAbility } from '../abilities/MovementAbility';
import { MovementInput } from '../input/UserInputController';
import { Slash } from '../weapons/Slash';

/** Non-player actor with random movement and a basic attack. */
export class Enemy extends Actor {
    private directionTimer = 0;
    private target?: Actor;
    private movementInput: MovementInput = { x: 0, y: 0 };

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'skeleton', 'skeleton-walk', 3);
        this.setDrag(900);
        this.speed = 70;
        this.grantAbility(new HitAbility());
        this.grantAbility(new MovementAbility());
        this.grantAbility(new AutoAimAbility());
        this.grantAbility(new DeathAbility());
        this.grantAbility(new AttackAbility((scene, owner) => new Slash(scene, owner, 44)));
    }

    setTarget(target: Actor) {
        this.target = target;
    }

    getAttackTargets() {
        return this.target ? [this.target] : [];
    }

    updateRandomMovement(delta: number) {
        this.directionTimer -= delta;
        if (this.directionTimer <= 0) {
            // Change direction periodically to patrol without pursuing the player.
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            this.movementInput = { x: Math.cos(angle), y: Math.sin(angle) };
            this.directionTimer = Phaser.Math.Between(700, 1800);
        }
    }

    getMovementInput() {
        return this.movementInput;
    }

    /** Returns whether the target is within attack range. */
    shouldAttack(target: Actor, range: number) {
        return target.active
            && Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= range;
    }

    /** Updates patrol movement and attacks when the player is in range. */
    update(delta: number) {
        this.updateRandomMovement(delta);
        if ((this.movementInput.x !== 0 || this.movementInput.y !== 0)
            && !this.hasActiveTag('basic-attack')
            && !this.hasActiveTag('death')) {
            this.tryActivateAbility('movement');
        } else {
            this.tryCancelAbility('movement');
        }
        this.updateAbilities(delta);
        if (this.movementInput.x !== 0 || this.movementInput.y !== 0) {
            this.tryActivateAbility('movement');
        }
        if (!this.active) {
            return;
        }

        const attackRange = 44;
        if (this.target && this.shouldAttack(this.target, attackRange)) {
            this.tryActivateAbility('auto-aim');
        }
    }

}
