import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';

/** Referencia temporal de un ataque activo en el mundo. */
export abstract class Weapon extends Phaser.GameObjects.Graphics {
    private readonly hitActors = new Set<Actor>();
    protected readonly origin: Phaser.Math.Vector2;
    protected readonly direction: Phaser.Math.Vector2;
    private remainingMs: number;

    protected constructor(
        scene: Phaser.Scene,
        readonly owner: Actor,
        durationMs = 140,
    ) {
        super(scene);
        this.origin = new Phaser.Math.Vector2(owner.x, owner.y);
        this.direction = owner.attackDirection.clone().normalize();
        this.remainingMs = durationMs;
        scene.add.existing(this);
        this.setPosition(this.origin.x, this.origin.y);
        this.setDepth(owner.depth + 1);
    }

    /** Inicializa la representación visual cuando la subclase ya está construida. */
    init() {
        this.draw();
        return this;
    }

    update(delta: number) {
        this.remainingMs -= delta;
        if (this.remainingMs <= 0) {
            this.destroy();
        }
    }

    canHit(target: Actor) {
        if (!target.active || target === this.owner || this.hitActors.has(target) || !this.contains(target)) {
            return false;
        }
        this.hitActors.add(target);
        return true;
    }

    protected abstract contains(target: Actor): boolean;

    protected abstract draw(): void;
}
