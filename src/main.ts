import * as Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

/**
 * Punto de entrada principal del juego. Inicializa la instancia de Phaser.
 */
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL, // Preferir WebGL como renderizador
    width: 800,
    height: 600,
    backgroundColor: '#111',
    parent: 'game', // Contenedor definido en index.html
    physics: {
        default: 'arcade'
    },
    scene: [GameScene],
    // Se pueden añadir propiedades de juego aquí si es necesario (ej. input managers)
};

const game = new Phaser.Game(config);