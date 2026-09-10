import * as Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

/** Main entry point that initializes Phaser. */
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: '#111',
    parent: 'game',
    physics: {
        default: 'arcade'
    },
    scene: [GameScene],
};

const game = new Phaser.Game(config);