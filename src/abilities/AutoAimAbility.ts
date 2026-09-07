import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';

/** Fija la dirección del siguiente ataque hacia un objetivo o vector explícito. */
export class AutoAimAbility extends GameplayAbility {
    constructor() {
        super('auto-aim', 0, 0, [], ['death', 'basic-attack'], []);
    }

    protected onActivate(owner: Actor) {
        const targets = owner.getAttackTargets();
        const manualDirection = owner.getManualAttackDirection();
        if (manualDirection && manualDirection.length() > 0) {
            this.setDirection(owner, manualDirection.x, manualDirection.y);
        } else {
            const targetRange = 20;
            const target = targets
                .filter((candidate) => candidate.active)
                .sort((left, right) =>
                    Phaser.Math.Distance.Between(owner.x, owner.y, left.x, left.y)
                    - Phaser.Math.Distance.Between(owner.x, owner.y, right.x, right.y))
                .find((candidate) =>
                    Phaser.Math.Distance.Between(owner.x, owner.y, candidate.x, candidate.y) <= targetRange);

            if (target) {
                this.setDirection(owner, target.x - owner.x, target.y - owner.y);
            } else {
                const fallbackDirection = owner.getFallbackAttackDirection();
                this.setDirection(owner, fallbackDirection.x, fallbackDirection.y);
            }
        }

        owner.tryActivateAbility('basic-attack');
    }

    private setDirection(owner: Actor, x: number, y: number) {
        owner.attackDirection.set(x, y).normalize();
        if (x !== 0) {
            owner.setFlipX(x < 0);
        }
    }
}
