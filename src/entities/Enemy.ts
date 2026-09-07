import * as Phaser from 'phaser';
import { Actor } from './Actor';
import { AttackAbility } from '../abilities/AttackAbility';
import { Slash } from '../weapons/Slash';

/** Actor no jugador con movimiento aleatorio y ataque básico. */
export class Enemy extends Actor {
    private directionTimer = 0;
    private target?: Actor;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'skeleton', 'skeleton-walk', 3);
        this.setDrag(900);
        this.grantAbility(new AttackAbility((scene, owner) => new Slash(scene, owner, 44) ));
        this.tryActivateAbility('movement');
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
            this.setVelocity(Math.cos(angle) * 70, Math.sin(angle) * 70);
            this.directionTimer = Phaser.Math.Between(700, 1800);
        }
        this.playMovementAnimation();
    }

    /** La IA solicita un ataque cuando el objetivo entra en su rango. */
    shouldAttack(target: Actor, range: number) {
        return target.active
            && Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= range;
    }

    /** Actualiza la patrulla y solicita ataques cuando el jugador entra en rango. */
    update(delta: number) {
        this.updateAbilities(delta);
        if (this.isBusy || !this.active) {
            return;
        }

        this.updateRandomMovement(delta);
        const attackRange = 44;
        if (this.target && this.shouldAttack(this.target, attackRange)) {
            this.tryActivateAbility('auto-aim');
        }
    }

}
