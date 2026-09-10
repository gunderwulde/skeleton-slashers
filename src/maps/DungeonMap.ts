import * as Phaser from 'phaser';

/** Builds the dungeon tilemap and configures its collisions. */
export class DungeonMap {
    readonly width = 60;
    readonly height = 45;
    readonly tileSize = 32;
    readonly layer: Phaser.Tilemaps.TilemapLayer;
    readonly worldWidth: number;
    readonly worldHeight: number;

    constructor(scene: Phaser.Scene) {
        const map = scene.make.tilemap({
            width: this.width,
            height: this.height,
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
        });
        const tileset = map.addTilesetImage('tiles');
        if (!tileset) {
            throw new Error('No se pudo cargar el tileset.');
        }

        const layer = map.createBlankLayer('dungeon', tileset, 0, 0);
        if (!layer) {
            throw new Error('No se pudo crear la capa de la mazmorra.');
        }
        this.layer = layer;
        this.worldWidth = this.width * this.tileSize;
        this.worldHeight = this.height * this.tileSize;

        this.createFloor(layer);
        this.createWalls(layer);
        this.createDecorations(layer);
        layer.setCollision([2, 5]);
    }

    /** Fills the playable area with two floor variants. */
    private createFloor(layer: Phaser.Tilemaps.TilemapLayer) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                layer.putTileAt((x + y) % 2, x, y);
            }
        }
    }

    /** Surrounds the map with solid walls and corners. */
    private createWalls(layer: Phaser.Tilemaps.TilemapLayer) {
        for (let x = 0; x < this.width; x++) {
            layer.putTileAt(x % 5 === 0 ? 5 : 2, x, 0);
            layer.putTileAt(x % 5 === 0 ? 5 : 2, x, this.height - 1);
        }
        for (let y = 1; y < this.height - 1; y++) {
            layer.putTileAt(y % 5 === 0 ? 5 : 2, 0, y);
            layer.putTileAt(y % 5 === 0 ? 5 : 2, this.width - 1, y);
        }
    }

    /** Places doors and torches as scene decoration. */
    private createDecorations(layer: Phaser.Tilemaps.TilemapLayer) {
        [8, 28, 48].forEach((x) => {
            layer.putTileAt(3, x, 0);
            layer.putTileAt(4, x - 1, 1);
            layer.putTileAt(4, x + 1, 1);
        });
        [[6, 6], [53, 6], [6, 38], [53, 38], [30, 5], [30, 39]].forEach(([x, y]) => {
            layer.putTileAt(4, x, y);
        });
    }
}
