import * as Phaser from 'phaser';
import { Actor } from './Actor';
import { AttackAbility } from '../abilities/AttackAbility';
import { Slash } from '../weapons/Slash';
import { MovementInput } from '../input/UserInputController';

/** Actor no jugador con movimiento aleatorio y ataque básico. */
export class Enemy extends Actor {
    private directionTimer = 0;
    private target?: Actor;
    private movementInput: MovementInput = { x: 0, y: 0 };

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'skeleton', 'skeleton-walk', 3);
        this.setDrag(900);
        this.speed = 70;
        this.grantAbility(new AttackAbility((scene, owner) => new Slash(scene, owner, 44) ));
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
            // Cambia de dirección periódicamente para patrullar sin perseguir al jugador.
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            this.movementInput = { x: Math.cos(angle), y: Math.sin(angle) };
            this.directionTimer = Phaser.Math.Between(700, 1800);
        }
    }

    getMovementInput() {
        return this.movementInput;
    }

    /** La IA solicita un ataque cuando el objetivo entra en su rango. */
    shouldAttack(target: Actor, range: number) {
        return target.active
            && Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= range;
    }

    /** Actualiza la patrulla y solicita ataques cuando el jugador entra en rango. */
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
        if (!this.active) {
            return;
        }

        const attackRange = 44;
        if (this.target && this.shouldAttack(this.target, attackRange)) {
            this.tryActivateAbility('auto-aim');
        }
    }

}
