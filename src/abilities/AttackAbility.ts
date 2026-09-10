import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';
import { Weapon } from '../weapons/Weapon';
import { Slash } from '../weapons/Slash';

/** Basic attack that creates a temporary weapon and animates the actor. */
export class AttackAbility extends GameplayAbility {
    constructor(
        private readonly weaponFactory: (scene: Phaser.Scene, owner: Actor) => Weapon = (scene, owner) => new Slash(scene, owner, 72),
    ) {
        super('basic-attack', 450, 110, [], ['death', 'basic-attack'], ['movement']);
    }

    protected onActivate() {
        const weapon = this.weaponFactory(this.owner.scene, this.owner).init();
        this.owner.scene.events.emit('weapon-created', weapon);
        this.owner.playAttackAnimation();
    }

    protected onEnd() {
        this.owner.setAngle(0);
    }

    protected onCancel() {
        this.owner.setAngle(0);
    }
}
