import * as Phaser from 'phaser';
import type { Actor } from '../entities/Actor';

/** Displays an actor's health bar above its head. */
export class ActorHub {
    private readonly graphics: Phaser.GameObjects.Graphics;
    private readonly unsubscribeHealth: () => void;

    constructor(private readonly actor: Actor) {
        this.graphics = actor.scene.add.graphics();
        this.graphics.setDepth(actor.depth + 1);
        this.unsubscribeHealth = actor.getHealthVariable().Subscribe(() => this.redraw());
        actor.scene.events.on('update', this.update, this);
        this.redraw();
    }

    destroy(): void {
        this.actor.scene.events.off('update', this.update, this);
        this.unsubscribeHealth();
        this.graphics.destroy();
    }

    private update(): void {
        if (!this.actor.active || !this.actor.visible) {
            this.graphics.setVisible(false);
            return;
        }

        this.graphics.setVisible(true);
        this.redraw();
    }

    private redraw(): void {
        const width = this.actor.displayWidth;
        const height = 4;
        const x = this.actor.x - width / 2;
        const y = this.actor.y - this.actor.displayHeight / 2 - height - 2;
        const healthRatio = Math.max(0, Math.min(1, this.actor.health / this.actor.maxHealth));

        this.graphics.clear();
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(x, y, width, height);
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillRect(x, y, width * healthRatio, height);
    }
}
