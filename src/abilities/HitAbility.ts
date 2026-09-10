import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';
import { Weapon } from '../weapons/Weapon';

/** Receives and validates impact from a weapon or attacker. */
export class HitAbility extends GameplayAbility {
    constructor() {
        super('hit', 0, 0, [], ['death'], ['movement']);
    }

    protected onActivate() {
        this.owner.receiveDamage();

        if (this.owner.health <= 0) {
            this.owner.tryActivateAbility('death');
        }
    }

    activateFromWeapon(weapon: Weapon): boolean {
        if (!weapon.owner.active) {
            return false;
        }
        return this.activate();
    }
}
