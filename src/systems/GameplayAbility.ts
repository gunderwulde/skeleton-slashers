import { Actor } from '../entities/Actor';

/** Base class for abilities with requirements and cooldowns. */
export abstract class GameplayAbility {
    readonly tag: string;
    readonly id: string;
    readonly cooldownMs: number;
    private cooldownRemaining = 0;
    private durationRemaining = 0;
    private active = false;
    private ownerInstance!: Actor;
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

    bindOwner(owner: Actor): void {
        this.ownerInstance = owner;
    }

    protected get owner(): Actor {
        return this.ownerInstance;
    }

    /** Reduces cooldowns and runs active ability loops. */
    update(delta: number): void {
        this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
        if (this.active) {
            this.onUpdate(delta);
            if (this.durationMs > 0) {
                this.durationRemaining -= delta;
                if (this.durationRemaining <= 0) {
                    this.owner.tryEndAbility(this.id);
                }
            }
        }
    }

    /** Checks whether the ability can run in the current state. */
    canActivate(): boolean {
        return this.owner.active
            && this.cooldownRemaining === 0
            && this.requiredTags.every((tag) => this.owner.hasActiveTag(tag))
            && this.blockedTags.every((tag) => !this.owner.hasActiveTag(tag))
            && this.checkRequirements();
    }

    /** Attempts activation and consumes cooldown on success. */
    activate(): boolean {
        if (!this.canActivate()) {
            return false;
        }

        this.cooldownRemaining = this.cooldownMs;
        this.active = this.durationMs !== 0;
        this.durationRemaining = this.durationMs;
        this.onActivate();
        return true;
    }

    get isActive(): boolean {
        return this.active;
    }

    end(): boolean {
        if (!this.active) {
            return false;
        }
        this.active = false;
        this.onEnd();
        return true;
    }

    cancel(): boolean {
        if (!this.active) {
            return false;
        }
        this.active = false;
        this.onCancel();
        return true;
    }

    /** Extension point for ability-specific requirements. */
    protected checkRequirements(): boolean {
        return true;
    }

    protected onUpdate(_delta: number) {}

    protected onEnd() {}

    protected onCancel() {}

    /** Concrete implementation executed on activation. */
    protected abstract onActivate(): void;
}
