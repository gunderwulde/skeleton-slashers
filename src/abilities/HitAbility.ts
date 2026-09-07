import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';
import { Weapon } from '../weapons/Weapon';

/** Recibe y valida el impacto producido por un arma o atacante. */
export class HitAbility extends GameplayAbility {
    constructor() {
        super('hit', 0, 0, [], ['death'], ['movement']);
    }

    protected onActivate(owner: Actor) {
        owner.receiveDamage();

        if (owner.health <= 0) {
            owner.tryActivateAbility('death');
        }
    }

    activateFromWeapon(owner: Actor, weapon: Weapon) {
        if (!owner.active || owner.hasActiveTag('death') || !weapon.owner.active) {
            return false;
        }
        this.onActivate(owner);
        return true;
    }
}
