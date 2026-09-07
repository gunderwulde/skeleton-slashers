import { Actor } from '../entities/Actor';
import { GameplayAbility } from './GameplayAbility';
import { MovementInput } from '../input/UserInputController';
import { MovementAbility } from '../abilities/MovementAbility';
import { Weapon } from '../weapons/Weapon';
import { HitAbility } from '../abilities/HitAbility';
import { AttackAbility } from '../abilities/AttackAbility';

/** Registro de habilidades concedidas a un actor y punto de activación común. */
export class AbilitySystem {
    private readonly abilities = new Map<string, GameplayAbility>();

    constructor(private readonly owner: Actor) {}

    /** Concede una habilidad una sola vez al actor. */
    grantAbility(ability: GameplayAbility) {
        if (this.abilities.has(ability.id)) {
            throw new Error(`La habilidad "${ability.id}" ya está concedida.`);
        }
        this.abilities.set(ability.id, ability);
    }

    /** Activa una habilidad por su identificador. */
    tryActivateAbility(id: string) {
        const ability = this.abilities.get(id);
        if (!ability) {
            throw new Error(`La habilidad "${id}" no está concedida al actor.`);
        }
        return ability.activate(this.owner);
    }

    /** Aplica la habilidad continua de movimiento. */
    applyMovement(input: MovementInput) {
        const movement = this.abilities.get('movement');
        if (!(movement instanceof MovementAbility)) {
            throw new Error('El actor no tiene concedida la habilidad de movimiento.');
        }
        movement.apply(this.owner, input);
    }

    activateHit(weapon: Weapon) {
        const hit = this.abilities.get('hit');
        if (!(hit instanceof HitAbility)) {
            throw new Error('El actor no tiene concedida la habilidad de impacto.');
        }
        return hit.activateFromWeapon(this.owner, weapon);
    }

    getAttackRange(): number {
        const attack = this.abilities.get('basic-attack');
        if (!(attack instanceof AttackAbility)) {
            throw new Error('El actor no tiene concedida la habilidad de ataque.');
        }
        return attack.getAttackRange();
    }

    /** Actualiza los cooldowns de todas las habilidades del actor. */
    update(delta: number) {
        this.abilities.forEach((ability) => ability.update(delta));
    }
}
