import { Actor } from '../entities/Actor';

/** Base class for abilities with requirements and cooldowns. */
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
     * @param durationMs 0 for an instant ability, positive for a limited
     * duration, and -1 for a permanent ability.
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

    /** Reduces cooldowns and runs active ability loops. */
    update(delta: number): void {
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

    /** Checks whether the ability can run in the current state. */
    canActivate(owner: Actor): boolean {
        return owner.active
            && this.cooldownRemaining === 0
            && this.requiredTags.every((tag) => owner.hasActiveTag(tag))
            && this.blockedTags.every((tag) => !owner.hasActiveTag(tag))
            && this.checkRequirements(owner);
    }

    /** Intenta activar la habilidad y consume su enfriamiento si tiene éxito. */
    activate(owner: Actor): boolean {
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

    get isActive(): boolean {
        return this.active;
    }

    end(owner: Actor): boolean {
        if (!this.active) {
            return false;
        }
        this.active = false;
        this.onEnd(owner);
        return true;
    }

    cancel(owner: Actor): boolean {
        if (!this.active) {
            return false;
        }
        this.active = false;
        this.onCancel(owner);
        return true;
    }

    /** Extension point for ability-specific requirements. */
    protected checkRequirements(_owner: Actor): boolean {
        return true;
    }

    protected onUpdate(_owner: Actor, _delta: number) {}

    protected onEnd(_owner: Actor) {}

    protected onCancel(_owner: Actor) {}

    /** Concrete implementation executed on activation. */
    protected abstract onActivate(owner: Actor): void;
}
