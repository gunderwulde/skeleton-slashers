import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';
import { Weapon } from './Weapon';

/** Area weapon that reaches actors within a circle. */
export class Area extends Weapon {
    constructor(
        scene: Phaser.Scene,
        owner: Actor,
        readonly radius: number,
    ) {
        super(scene, owner);
    }

    protected contains(target: Actor) {
        return Phaser.Math.Distance.Between(this.origin.x, this.origin.y, target.x, target.y)
            <= this.radius + target.displayWidth / 2;
    }

    protected draw() {
        this.fillStyle(0xffe08a, 0.38);
        this.lineStyle(2, 0xfff1b0, 0.75);
        this.fillCircle(0, 0, this.radius);
        this.strokeCircle(0, 0, this.radius);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 1.15,
            duration: 140,
            ease: 'Cubic.Out',
        });
    }
}
