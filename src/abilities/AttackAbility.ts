import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';
import { GameplayAbility } from '../systems/GameplayAbility';
import { Weapon } from '../weapons/Weapon';
import { Slash } from '../weapons/Slash';

/** Ataque básico: crea un arma temporal y reproduce la animación del actor. */
export class AttackAbility extends GameplayAbility {
    constructor(
        private readonly weaponFactory: (scene: Phaser.Scene, owner: Actor) => Weapon = (scene, owner) => new Slash(scene, owner, 72),
        private readonly attackRange = 72,
    ) {
        super('basic-attack', 450);
    }

    getAttackRange() {
        return this.attackRange;
    }

    protected onActivate(owner: Actor) {
        const weapon = this.weaponFactory(owner.scene, owner).init();
        owner.scene.events.emit('weapon-created', weapon);
        owner.playAttackAnimation();
    }
}
