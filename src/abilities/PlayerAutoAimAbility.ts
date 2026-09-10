import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';

/** Player auto-aim uses manual input and movement direction as fallback. */
export class PlayerAutoAimAbility extends GameplayAbility {
    constructor() {
        super('auto-aim', 0, 0, [], ['death', 'basic-attack'], []);
    }

    protected onActivate() {
        const owner = this.owner;
        const targets = owner.getAttackTargets();
        const manualDirection = owner.getManualAttackDirection();

        if (manualDirection && manualDirection.length() > 0) {
            this.orientActorToDirection(owner, manualDirection.x, manualDirection.y);
        } else {
            const direction = this.getNearestTargetDirection(owner, targets, owner.getFallbackAttackDirection());
            this.orientActorToDirection(owner, direction.x, direction.y);
        }

        owner.tryActivateAbility('basic-attack');
    }

    protected getNearestTargetDirection(
        owner: Actor,
        targets: Actor[],
        fallback: Phaser.Math.Vector2,
    ): Phaser.Math.Vector2 {
        const targetRange = 50;
        const target = targets
            .filter((candidate) => candidate.active)
            .sort((left, right) =>
                Phaser.Math.Distance.Between(owner.x, owner.y, left.x, left.y)
                - Phaser.Math.Distance.Between(owner.x, owner.y, right.x, right.y))
            .find((candidate) =>
                Phaser.Math.Distance.Between(owner.x, owner.y, candidate.x, candidate.y) <= targetRange);
    
        if (target) {
            return new Phaser.Math.Vector2(target.x - owner.x, target.y - owner.y).normalize();
        }
    
        return fallback.clone().normalize();
    }

    protected orientActorToDirection(owner: Actor, x: number, y: number): void {
        owner.attackDirection.set(x, y).normalize();
        if (x !== 0) {
            owner.setFlipX(x < 0);
        }
    }
}
