import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';
import { Weapon } from './Weapon';

/** Frontal arc-shaped attack weapon. */
export class Slash extends Weapon {
    constructor(
        scene: Phaser.Scene,
        owner: Actor,
        readonly range: number,
        readonly halfAngle = 0.8,
    ) {
        super(scene, owner);
    }

    protected contains(target: Actor) {
        const offset = new Phaser.Math.Vector2(target.x - this.origin.x, target.y - this.origin.y);
        if (offset.length() > this.range + target.displayWidth / 2) {
            return false;
        }
        return Math.abs(
            Phaser.Math.Angle.Wrap(this.direction.angle() - offset.angle()),
        ) <= this.halfAngle;
    }

    protected draw() {
        this.fillStyle(0xffe08a, 0.38);
        this.lineStyle(2, 0xfff1b0, 0.75);
        this.beginPath();
        const angle = this.direction.angle();
        this.arc(0, 0, this.range, angle - this.halfAngle, angle + this.halfAngle);
        this.lineTo(0, 0);
        this.closePath();
        this.fillPath();
        this.strokePath();

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 1.15,
            duration: 140,
            ease: 'Cubic.Out',
        });
    }

}
