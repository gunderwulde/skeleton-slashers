import * as Phaser from 'phaser';
import { Actor } from '../entities/Actor';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { DungeonMap } from '../maps/DungeonMap';
import { Weapon } from '../weapons/Weapon';

/** Coordinates the world, actors, temporary weapons, and UI. */
export class GameScene extends Phaser.Scene {
    private player!: Player;
    private enemies: Enemy[] = [];
    private actors: Actor[] = [];
    private weapons: Weapon[] = [];
    private dungeonMap!: DungeonMap;
    private statusText!: Phaser.GameObjects.Text;

    constructor() {
        super('GameScene');
    }

    preload() {
        console.log('Loading GameScene assets...');
        this.load.image('tiles', 'assets/tileset.svg');
        this.load.spritesheet('player', 'assets/player.svg', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('skeleton', 'assets/skeleton.svg', {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    create() {
        console.log('GameScene created: dungeon and combat started.');
        this.createAnimations();
        this.dungeonMap = new DungeonMap(this);
        this.createActors();
        this.createInterface();

        this.physics.world.setBounds(0, 0, this.dungeonMap.worldWidth, this.dungeonMap.worldHeight);
        this.cameras.main.setBounds(0, 0, this.dungeonMap.worldWidth, this.dungeonMap.worldHeight);
        this.cameras.main.setDeadzone(100, 100);
        this.cameras.main.startFollow(this.player, true, 1, 1);
        this.events.on('weapon-created', this.registerWeapon, this);
    }

    update(_time: number, delta: number) {
        this.actors.forEach((actor) => actor.setActiveWeapons(this.weapons));
        this.actors.forEach((actor) => actor.update(delta));
        this.actors.forEach((actor) => actor.checkWeaponHits());
        this.weapons = this.weapons.filter((weapon) => {
            if (!weapon.active) {
                return false;
            }
            weapon.update(delta);
            return weapon.active;
        });
    }

    private createActors() {
        this.player = new Player(this, 100, 100);
        this.enemies = [
            new Enemy(this, 900, 500),
            new Enemy(this, 1200, 700),
            new Enemy(this, 1500, 350),
        ];
        this.actors = [this.player, ...this.enemies];
        this.player.setTargets(this.enemies);
        this.enemies.forEach((enemy) => enemy.setTarget(this.player));

        this.actors.forEach((actor) => {
            actor.on('damaged', this.updateStatus, this);
            actor.on('died', () => this.handleActorDeath(actor));
            this.physics.add.collider(actor, this.dungeonMap.layer);
        });
    }

    private createInterface() {
        this.add.text(50, 40, 'Mazmorra de las catacumbas', {
            fontSize: '24px',
            color: '#e7d27c',
            fontStyle: 'bold',
        });
        this.statusText = this.add.text(16, 16, '', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#171923',
            padding: { x: 8, y: 6 },
        }).setScrollFactor(0).setDepth(10);
        this.updateStatus();
    }

    private handleActorDeath(actor: Actor) {
        if (actor === this.player) {
            this.statusText.setText('You died. Reload the page to try again.');
        } else if (this.enemies.every((enemy) => !enemy.active)) {
            this.statusText.setText('All skeletons have been defeated.');
        }
    }

    private registerWeapon(weapon: Weapon) {
        this.weapons.push(weapon);
    }

    private createAnimations() {
        this.anims.create({
            key: 'player-walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: 'skeleton-walk',
            frames: this.anims.generateFrameNumbers('skeleton', { start: 0, end: 2 }),
            frameRate: 7,
            repeat: -1,
        });
    }

    private updateStatus() {
        if (this.statusText) {
            this.statusText.setText(
                `Vida: ${'♥'.repeat(this.player.health)}${'♡'.repeat(this.player.maxHealth - this.player.health)}   WASD: mover   Click izquierdo: atacar`,
            );
        }
    }
}
