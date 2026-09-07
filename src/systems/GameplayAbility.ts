import { Actor } from '../entities/Actor';

/** Clase base para habilidades con requisitos y enfriamiento. */
export abstract class GameplayAbility {
    readonly id: string;
    readonly cooldownMs: number;
    private cooldownRemaining = 0;
    private durationRemaining = 0;
    private active = false;
    private owner?: Actor;

    protected constructor(id: string, cooldownMs: number, durationMs = 0) {
        this.id = id;
        this.cooldownMs = cooldownMs;
        this.durationMs = durationMs;
    }
    private readonly durationMs: number;

    /** Reduce el enfriamiento usando el tiempo transcurrido del juego. */
    update(delta: number) {
        this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
        if (this.active && this.owner) {
            this.onUpdate(this.owner, delta);
            if (this.durationMs > 0) {
                this.durationRemaining -= delta;
                if (this.durationRemaining <= 0) {
                    this.active = false;
                    this.onEnd(this.owner);
                }
            }
        }
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
        this.owner = owner;
        this.active = this.durationMs !== 0;
        this.durationRemaining = this.durationMs;
        this.onActivate(owner);
        return true;
    }

    /** Punto de extensión para requisitos específicos de cada habilidad. */
    protected checkRequirements(_owner: Actor) {
        return true;
    }

    protected onUpdate(_owner: Actor, _delta: number) {}

    protected onEnd(_owner: Actor) {}

    /** Implementación concreta que se ejecuta al activar la habilidad. */
    protected abstract onActivate(owner: Actor): void;
}
