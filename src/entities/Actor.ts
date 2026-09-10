import * as Phaser from 'phaser';
import { Variable } from '../core/Variable';
import { AbilitySystem } from '../systems/AbilitySystem';
import { GameplayAbility } from '../systems/GameplayAbility';
import { ActorHub } from '../ui/ActorHub';
import type { Weapon } from '../weapons/Weapon';
        
/** Shared physical entity for players and enemies. */
export abstract class Actor extends Phaser.Physics.Arcade.Sprite {
    readonly maxHealth: number;
    private readonly healthVariable: Variable<number>;
    speed = 220;
    protected readonly walkAnimation: string;
    readonly abilities: AbilitySystem;
    readonly actorHub: ActorHub;
    readonly attackDirection = new Phaser.Math.Vector2(1, 0);
    private activeWeapons: Weapon[] = [];
    readonly activeGameplayTags = new Set<string>();

    protected constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        walkAnimation: string,
        maxHealth: number,
    ) {
        super(scene, x, y, texture, 0);
        this.maxHealth = maxHealth;
        this.healthVariable = new Variable<number>(maxHealth);
        this.walkAnimation = walkAnimation;
        this.abilities = new AbilitySystem(this);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.actorHub = new ActorHub(this);
    }

    get health(): number {
        return this.healthVariable.Get();
    }

    set health(value: number) {
        this.healthVariable.Set(value);
    }

    getHealthVariable(): Variable<number> {
        return this.healthVariable;
    }

    /** Updates cooldowns and the lifecycle of active abilities. */
    updateAbilities(delta: number) {
        this.abilities.update(delta);
    }

    setActiveWeapons(weapons: Weapon[]) {
        this.activeWeapons = weapons;
    }

    checkWeaponHits() {
        this.activeWeapons.forEach((weapon) => {
            if (weapon.active && weapon.canHit(this)) {
                this.abilities.activateHit(weapon);
            }
        });
    }

    /** Adds an ability to the actor's available abilities. */
    grantAbility(ability: GameplayAbility) {
        this.abilities.grantAbility(ability);
    }

    /** Requests activation of a specific ability. */
    tryActivateAbility(id: string) {
        return this.abilities.tryActivateAbility(id);
    }

    tryCancelAbility(idOrTag: string) {
        return this.abilities.tryCancelAbility(idOrTag);
    }

    tryEndAbility(idOrTag: string) {
        return this.abilities.tryEndAbility(idOrTag);
    }

    addActiveTag(tag: string) {
        this.activeGameplayTags.add(tag);
    }

    removeActiveTag(tag: string) {
        this.activeGameplayTags.delete(tag);
    }

    hasActiveTag(tag: string) {
        return this.activeGameplayTags.has(tag);
    }

    getActiveGameplayTags() {
        return [...this.activeGameplayTags];
    }

    /** Returns the input consumed by the movement ability. */
    getMovementInput() {
        return { x: 0, y: 0 };
    }

    /** Returns a manual attack direction when one is available. */
    getManualAttackDirection(): Phaser.Math.Vector2 | undefined {
        return undefined;
    }

    /** Returns actors that can be reached by an attack. */
    getAttackTargets(): Actor[] {
        return [];
    }

    /** Returns the fallback direction used by auto-aim. */
    getFallbackAttackDirection() {
        const body = this.body;
        if (body && body.velocity.length() > 0) {
            return body.velocity.clone().normalize();
        }
        return this.attackDirection.clone();
    }

    /** Plays the walk animation and flips the sprite horizontally. */
    playMovementAnimation() {
        const body = this.body;
        if (!body) {
            throw new Error('El actor no tiene un cuerpo físico.');
        }

        if (body.velocity.length() > 0) {
            this.anims.play(this.walkAnimation, true);
        } else {
            this.anims.stop();
            this.setFrame(0);
        }

        if (body.velocity.x < 0) {
            this.setFlipX(true);
        } else if (body.velocity.x > 0) {
            this.setFlipX(false);
        }
    }

    /** Applies damage feedback and returns remaining health. */
    receiveDamage() {
        this.health = Math.max(0, this.health - 1);
        this.emit('damaged', this);
        this.setTint(0xff4545);
        this.scene.tweens.add({
            targets: this,
            alpha: 0.35,
            duration: 70,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.clearTint();
                this.setAlpha(1);
            },
        });
        return this.health;
    }

    /** Plays only the actor's attack animation. */
    playAttackAnimation() {
        this.setVelocity(0, 0);
        this.anims.stop();
        const direction = this.flipX ? -1 : 1;
        this.scene.tweens.add({
            targets: this,
            angle: 35 * direction,
            duration: 110,
            yoyo: true,
            ease: 'Quad.Out',
        });
    }

    /** Disables the body and plays the death animation. */
    playDeath(onComplete: () => void) {
        this.setVelocity(0, 0);
        const body = this.body;
        if (!body) {
            throw new Error('El actor no tiene un cuerpo físico.');
        }
        body.enable = false;
        this.anims.stop();

        this.scene.tweens.add({
            targets: this,
            angle: this.flipX ? -90 : 90,
            alpha: 0,
            scale: 0.4,
            duration: 700,
            ease: 'Cubic.In',
            onComplete: () => {
                this.setActive(false).setVisible(false);
                this.emit('died', this);
                onComplete();
            },
        });
    }
}
