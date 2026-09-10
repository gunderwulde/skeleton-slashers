import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';

/** Disables the actor and blocks other abilities during death. */
export class DeathAbility extends GameplayAbility {
    constructor() {
        super('death', 0, -1, [], [], ['movement', 'basic-attack', 'hit', 'auto-aim']);
    }

    canActivate(owner: Actor) {
        return owner.active && owner.health <= 0 && !owner.hasActiveTag(this.tag);
    }

    protected onActivate(owner: Actor) {
        owner.playDeath(() => undefined);
    }
}
