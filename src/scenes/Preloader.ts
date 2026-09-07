import * as Phaser from 'phaser';

// Define la escena Preloader
export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        console.log("Cargando assets para el Preloader...");
        // Cargar un asset de prueba: Un rectángulo simple en lugar de URL externa
        this.add.graphics()
            .fillStyle(0xff0000, 1) // Rojo semi-transparente
            .fillRect(200, 150, 300, 50);

    }

    create() {
        console.log("Preloader Scene Creada. Iniciando transición...");
        // Transición a la próxima escena después de un breve retraso
        this.scene.start('GameScene');
    }
}