import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';

/** Continuous ability that converts abstract input into physical velocity. */
export class MovementAbility extends GameplayAbility {
    constructor() {
        super('movement', 0, -1, [], ['death', 'basic-attack'], []);
    }

    protected onUpdate(_delta: number): void {
        const input = this.owner.getMovementInput();
        if (!this.owner.active || this.owner.hasActiveTag('basic-attack') || this.owner.hasActiveTag('death')) {
            this.owner.setVelocity(0, 0);
            return;
        }

        // Prevent diagonal movement from being faster than horizontal movement.
        const length = Math.hypot(input.x, input.y);
        const normalizedX = length > 1 ? input.x / length : input.x;
        const normalizedY = length > 1 ? input.y / length : input.y;
        this.owner.setVelocity(normalizedX * this.owner.speed, normalizedY * this.owner.speed);
        this.owner.playMovementAnimation();
    }

    protected onActivate() {}

    protected onCancel() {
        this.owner.setVelocity(0, 0);
        this.owner.playMovementAnimation();
    }

}
