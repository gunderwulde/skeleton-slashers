import { Actor } from '../entities/Actor';

/** Clase base para habilidades con requisitos y enfriamiento. */
export abstract class GameplayAbility {
    readonly tag: string;
    readonly id: string;
    readonly cooldownMs: number;
    private cooldownRemaining = 0;
    private durationRemaining = 0;
    private active = false;
    private owner?: Actor;
    readonly requiredTags: readonly string[];
    readonly blockedTags: readonly string[];
    readonly cancellationTags: readonly string[];

    /**
     * @param durationMs 0 para una habilidad instantánea, positivo para una
     * duración limitada y -1 para una habilidad permanente.
     */
    protected constructor(
        tag: string,
        cooldownMs: number,
        durationMs = 0,
        requiredTags: readonly string[] = [],
        blockedTags: readonly string[] = [],
        cancellationTags: readonly string[] = [],
    ) {
        this.tag = tag;
        this.id = tag;
        this.cooldownMs = cooldownMs;
        this.durationMs = durationMs;
        this.requiredTags = requiredTags;
        this.blockedTags = blockedTags;
        this.cancellationTags = cancellationTags;
    }
    private readonly durationMs: number;

    /** Reduce el enfriamiento y ejecuta el loop de las habilidades activas. */
    update(delta: number) {
        this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
        if (this.active && this.owner) {
            this.onUpdate(this.owner, delta);
            if (this.durationMs > 0) {
                this.durationRemaining -= delta;
                if (this.durationRemaining <= 0) {
                    this.owner.tryEndAbility(this.id);
                }
            }
        }
    }

    /** Comprueba si la habilidad puede ejecutarse en el estado actual. */
    canActivate(owner: Actor) {
        return owner.active
            && this.cooldownRemaining === 0
            && this.requiredTags.every((tag) => owner.hasActiveTag(tag))
            && this.blockedTags.every((tag) => !owner.hasActiveTag(tag))
            && this.checkRequirements(owner);
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

    get isActive() {
        return this.active;
    }

    end(owner: Actor) {
        if (!this.active) {
            return false;
        }
        this.active = false;
        this.onEnd(owner);
        return true;
    }

    cancel(owner: Actor) {
        if (!this.active) {
            return false;
        }
        this.active = false;
        this.onCancel(owner);
        return true;
    }

    /** Punto de extensión para requisitos específicos de cada habilidad. */
    protected checkRequirements(_owner: Actor) {
        return true;
    }

    protected onUpdate(_owner: Actor, _delta: number) {}

    protected onEnd(_owner: Actor) {}

    protected onCancel(_owner: Actor) {}

    /** Implementación concreta que se ejecuta al activar la habilidad. */
    protected abstract onActivate(owner: Actor): void;
}
