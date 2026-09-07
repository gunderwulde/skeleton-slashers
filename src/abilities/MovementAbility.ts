import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';

/** Habilidad continua que convierte una entrada abstracta en velocidad física. */
export class MovementAbility extends GameplayAbility {
    constructor() {
        super('movement', 0, -1);
    }

    protected onUpdate(owner: Actor) {
        const input = owner.getMovementInput();
        if (!owner.active || owner.isBusy) {
            owner.setVelocity(0, 0);
            return;
        }

        // Evita que el movimiento diagonal sea más rápido que el horizontal.
        const length = Math.hypot(input.x, input.y);
        const normalizedX = length > 1 ? input.x / length : input.x;
        const normalizedY = length > 1 ? input.y / length : input.y;
        owner.setVelocity(normalizedX * 220, normalizedY * 220);
        owner.playMovementAnimation();
    }

    protected onActivate() {}

}
