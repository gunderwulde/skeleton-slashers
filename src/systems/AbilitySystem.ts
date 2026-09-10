import { Actor } from '../entities/Actor';
import { GameplayAbility } from './GameplayAbility';
import { Weapon } from '../weapons/Weapon';
import { HitAbility } from '../abilities/HitAbility';
import { AttackAbility } from '../abilities/AttackAbility';

/** Registry of granted abilities and common activation entry point. */
export class AbilitySystem {
    private readonly abilities = new Map<string, GameplayAbility>();

    constructor(private readonly owner: Actor) {}

    /** Grants an ability once to the actor. */
    grantAbility(ability: GameplayAbility, owner: Actor = this.owner) {
        ability.bindOwner(owner);
        if (this.abilities.has(ability.id)) {
            throw new Error(`Ability "${ability.id}" is already granted.`);
        }
        this.abilities.set(ability.id, ability);
    }

    /** Activates an ability by identifier. */
    tryActivateAbility(id: string) {
        const ability = this.abilities.get(id);
        if (!ability) {
            throw new Error(`Ability "${id}" is not granted to the actor.`);
        }
        if (!ability.canActivate()) {
            return false;
        }
        ability.cancellationTags.forEach((tag) => this.owner.tryCancelAbility(tag));
        const activated = ability.activate();
        if (activated && ability.isActive) {
            this.owner.addActiveTag(ability.tag);
        }
        return activated;
    }

    tryCancelAbility(idOrTag: string): boolean {
        const abilities = this.findAbilities(idOrTag).filter((ability) => ability.isActive);
        let cancelled = false;
        abilities.forEach((ability) => {
            if (ability.cancel()) {
                this.owner.removeActiveTag(ability.tag);
                cancelled = true;
            }
        });
        return cancelled;
    }

    tryEndAbility(idOrTag: string): boolean {
        const abilities = this.findAbilities(idOrTag).filter((ability) => ability.isActive);
        let ended = false;
        abilities.forEach((ability) => {
            if (ability.end()) {
                this.owner.removeActiveTag(ability.tag);
                ended = true;
            }
        });
        return ended;
    }

    activateHit(weapon: Weapon) {
        const hit = this.abilities.get('hit');
        if (!(hit instanceof HitAbility)) {
            throw new Error('The actor has no granted hit ability.');
        }
        return hit.activateFromWeapon(weapon);
    }

    /** Updates cooldowns and loops for all actor abilities. */
    update(delta: number) {
        this.abilities.forEach((ability) => ability.update(delta));
    }

    private findAbilities(idOrTag: string): GameplayAbility[] {
        const ability = this.abilities.get(idOrTag);
        return ability
            ? [ability]
            : [...this.abilities.values()].filter((candidate) => candidate.tag === idOrTag);
    }
}
