import * as Phaser from 'phaser';

export interface MovementInput {
    x: number;
    y: number;
}

/** Common abstraction for player input devices. */
export abstract class UserInputController {
    protected attackRequested = false;

    abstract getMovement(): MovementInput;

    /** Returns the direction for the next attack, when available. */
    getAttackDirection(): MovementInput | undefined {
        return undefined;
    }

    /** Returns and consumes a pending attack request. */
    consumeAttackRequest() {
        const requested = this.attackRequested;
        this.attackRequested = false;
        return requested;
    }
}

/** Controller for WASD and left-click input. */
export class KeyboardMouseController extends UserInputController {
    private readonly keys: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };

    constructor(private readonly scene: Phaser.Scene) {
        super();
        const keyboard = scene.input.keyboard;
        if (!keyboard) {
            throw new Error('Keyboard input is unavailable.');
        }

        this.keys = {
            up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        scene.input.on('pointerdown', this.handlePointerDown, this);
    }

    getMovement(): MovementInput {
        // MovementAbility later converts the normalized output into velocity.
        const movement = {
            x: Number(this.keys.right.isDown) - Number(this.keys.left.isDown),
            y: Number(this.keys.down.isDown) - Number(this.keys.up.isDown),
        };
        return movement;
    }

    getAttackDirection() {
        const movement = this.getMovement();
        return movement.x !== 0 || movement.y !== 0 ? movement : undefined;
    }

    /** Converts a left click into a consumable attack request. */
    private handlePointerDown(pointer: Phaser.Input.Pointer) {
        if (pointer.leftButtonDown()) {
            this.attackRequested = true;
        }
    }
}

/** Controller for the left stick and primary gamepad button. */
export class GamepadController extends UserInputController {
    private readonly pad: Phaser.Input.Gamepad.Gamepad;

    constructor(scene: Phaser.Scene) {
        super();
        const pad = scene.input.gamepad?.getPad(0);
        if (!pad) {
            throw new Error('No hay ningún gamepad conectado.');
        }
        this.pad = pad;
        this.pad.on('down', (button: Phaser.Input.Gamepad.Button) => {
            if (button.index === 0) {
                this.attackRequested = true;
            }
        });
    }

    getMovement(): MovementInput {
        // The dead zone prevents small movements caused by stick noise.
        const x = this.pad.leftStick.x;
        const y = this.pad.leftStick.y;
        return {
            x: Math.abs(x) > 0.2 ? x : 0,
            y: Math.abs(y) > 0.2 ? y : 0,
        };
    }

    getAttackDirection() {
        const movement = this.getMovement();
        return movement.x !== 0 || movement.y !== 0 ? movement : undefined;
    }
}
