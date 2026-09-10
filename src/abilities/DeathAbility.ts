import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';

/** Disables the actor and blocks other abilities during death. */
export class DeathAbility extends GameplayAbility {
    constructor() {
        super('death', 0, -1, [], [], ['movement', 'basic-attack', 'hit', 'auto-aim']);
    }

    canActivate(): boolean {
        return this.owner.active && this.owner.health <= 0 && !this.owner.hasActiveTag(this.tag);
    }

    protected onActivate() {
        this.owner.playDeath(() => undefined);
    }
}
