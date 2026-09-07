import { Actor } from '../entities/Actor';

/** Clase base para habilidades con requisitos y enfriamiento. */
export abstract class GameplayAbility {
    readonly id: string;
    readonly cooldownMs: number;
    private cooldownRemaining = 0;

    protected constructor(id: string, cooldownMs: number) {
        this.id = id;
        this.cooldownMs = cooldownMs;
    }

    /** Reduce el enfriamiento usando el tiempo transcurrido del juego. */
    update(delta: number) {
        this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
    }

    /** Comprueba si la habilidad puede ejecutarse en el estado actual. */
    canActivate(owner: Actor) {
        return owner.active && !owner.isBusy && this.cooldownRemaining === 0 && this.checkRequirements(owner);
    }

    /** Intenta activar la habilidad y consume su enfriamiento si tiene éxito. */
    activate(owner: Actor) {
        if (!this.canActivate(owner)) {
            return false;
        }

        this.cooldownRemaining = this.cooldownMs;
        this.onActivate(owner);
        return true;
    }

    /** Punto de extensión para requisitos específicos de cada habilidad. */
    protected checkRequirements(_owner: Actor) {
        return true;
    }

    /** Implementación concreta que se ejecuta al activar la habilidad. */
    protected abstract onActivate(owner: Actor): void;
}
