import * as Phaser from 'phaser';
import { Player } from '../entities/Player';

/** Main HUD for player status and game messages. */
export class MainUI {
    private readonly statusText: Phaser.GameObjects.Text;

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly player: Player,
    ) {
        this.scene.add.text(50, 40, 'Mazmorra de las catacumbas', {
            fontSize: '24px',
            color: '#e7d27c',
            fontStyle: 'bold',
        });

        this.statusText = this.scene.add.text(16, 16, '', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#171923',
            padding: { x: 8, y: 6 },
        }).setScrollFactor(0).setDepth(10);

        this.player.getHealthVariable().Subscribe((currentValue, previousValue) => {
            this.updateHealth(currentValue, previousValue);
        });
        this.updateHealth();
    }

    showPlayerDeath(): void {
        this.statusText.setText('You died. Reload the page to try again.');
    }

    showVictory(): void {
        this.statusText.setText('All skeletons have been defeated.');
    }

    private updateHealth(currentValue = this.player.health, _previousValue = currentValue): void {
        this.statusText.setText(
            `Vida: ${'♥'.repeat(currentValue)}${'♡'.repeat(this.player.maxHealth - currentValue)}   WASD: mover   Click izquierdo: atacar`,
        );
    }
}
