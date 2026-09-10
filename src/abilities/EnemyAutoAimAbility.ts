import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';
import { DependencyInjector } from '../core/DependencyInjector';
import type { IPlayer } from '../interfaces/IPlayer';
import { GameplayAbility } from '../systems/GameplayAbility';

/** Enemy auto-aim uses the injected player reference as the target. */
export class EnemyAutoAimAbility extends GameplayAbility {
    constructor() {
        super('auto-aim', 0, 0, [], ['death', 'basic-attack'], []);
    }

    protected onActivate() {
        const owner = this.owner;
        const player = DependencyInjector.Resolve<IPlayer>('player');

        if (player.active) {
            const direction = new Phaser.Math.Vector2(player.x - owner.x, player.y - owner.y).normalize();
            owner.attackDirection.set(direction.x, direction.y).normalize();
            if (direction.x !== 0) {
                owner.setFlipX(direction.x < 0);
            }
        }

        owner.tryActivateAbility('basic-attack');
    }
}
