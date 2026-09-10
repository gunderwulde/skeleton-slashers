import * as Phaser from 'phaser';

// Defines the preloader scene.
export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        console.log('Loading preloader assets...');
        // Draw a local placeholder instead of loading an external URL.
        this.add.graphics()
            .fillStyle(0xff0000, 1)
            .fillRect(200, 150, 300, 50);

    }

    create() {
        console.log('Preloader scene created. Starting transition...');
        // Transition to the next scene after a short delay.
        this.scene.start('GameScene');
    }
}