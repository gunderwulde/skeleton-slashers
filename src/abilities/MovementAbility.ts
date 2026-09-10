import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';

/** Continuous ability that converts abstract input into physical velocity. */
export class MovementAbility extends GameplayAbility {
    constructor() {
        super('movement', 0, -1, [], ['death', 'basic-attack'], []);
    }

    protected onUpdate(owner: Actor, _delta: number): void {
        const input = owner.getMovementInput();
        if (!owner.active || owner.hasActiveTag('basic-attack') || owner.hasActiveTag('death')) {
            owner.setVelocity(0, 0);
            return;
        }

        // Prevent diagonal movement from being faster than horizontal movement.
        const length = Math.hypot(input.x, input.y);
        const normalizedX = length > 1 ? input.x / length : input.x;
        const normalizedY = length > 1 ? input.y / length : input.y;
        owner.setVelocity(normalizedX * owner.speed, normalizedY * owner.speed);
        owner.playMovementAnimation();
    }

    protected onActivate() {}

    protected onCancel(owner: Actor) {
        owner.setVelocity(0, 0);
        owner.playMovementAnimation();
    }

}
