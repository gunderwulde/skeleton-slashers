import * as Phaser from 'phaser';
import { AbilitySystem } from '../systems/AbilitySystem';
import { HitAbility } from '../abilities/HitAbility';
import { MovementAbility } from '../abilities/MovementAbility';
import { AutoAimAbility } from '../abilities/AutoAimAbility';
import { DeathAbility } from '../abilities/DeathAbility';
import { GameplayAbility } from '../systems/GameplayAbility';
import type { Weapon } from '../weapons/Weapon';
        
/** Entidad física común para el jugador y los enemigos. */
export abstract class Actor extends Phaser.Physics.Arcade.Sprite {
    readonly maxHealth: number;
    health: number;
    speed = 220;
    protected readonly walkAnimation: string;
    readonly abilities: AbilitySystem;
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
        this.health = maxHealth;
        this.walkAnimation = walkAnimation;
        this.abilities = new AbilitySystem(this);
        this.grantAbility(new HitAbility());
        this.grantAbility(new MovementAbility());
        this.grantAbility(new AutoAimAbility());
        this.grantAbility(new DeathAbility());
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
    }

    /** Actualiza cooldowns y el ciclo de vida de las habilidades activas. */
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

    /** Añade una habilidad al conjunto disponible del actor. */
    grantAbility(ability: GameplayAbility) {
        this.abilities.grantAbility(ability);
    }

    /** Solicita la activación de una habilidad concreta. */
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

    /** Devuelve la entrada que consume la habilidad de movimiento. */
    getMovementInput() {
        return { x: 0, y: 0 };
    }

    /** Devuelve una dirección manual de ataque si el actor dispone de ella. */
    getManualAttackDirection(): Phaser.Math.Vector2 | undefined {
        return undefined;
    }

    /** Devuelve los actores que pueden ser alcanzados por el ataque. */
    getAttackTargets(): Actor[] {
        return [];
    }

    /** Devuelve la dirección usada si el autoaim no encuentra un objetivo. */
    getFallbackAttackDirection() {
        const body = this.body;
        if (body && body.velocity.length() > 0) {
            return body.velocity.clone().normalize();
        }
        return this.attackDirection.clone();
    }

    /** Reproduce la animación de caminar y orienta el sprite horizontalmente. */
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

    /** Aplica daño visual y devuelve la vida restante. */
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

    /** Reproduce únicamente la animación corporal del ataque. */
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

    /** Desactiva el cuerpo y reproduce la animación de muerte. */
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
