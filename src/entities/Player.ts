import * as Phaser from 'phaser';
import { Actor } from './Actor';
import { AttackAbility } from '../abilities/AttackAbility';
import { KeyboardMouseController, UserInputController } from '../input/UserInputController';

/** Actor controlado por el usuario y equipado con el ataque básico. */
export class Player extends Actor {
    private readonly inputController: UserInputController;
    private readonly lastMovementDirection = new Phaser.Math.Vector2(1, 0);
    private targets: Actor[] = [];

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        inputController: UserInputController = new KeyboardMouseController(scene),
    ) {
        super(scene, x, y, 'player', 'player-walk', 3);
        this.setDrag(1000);
        this.inputController = inputController;
        this.grantAbility(new AttackAbility());
    }

    setTargets(targets: Actor[]) {
        this.targets = targets;
    }

    getAttackTargets() {
        return this.targets;
    }

    getMovementInput() {
        const movement = this.inputController.getMovement();
        if (movement.x !== 0 || movement.y !== 0) {
            this.lastMovementDirection.set(movement.x, movement.y).normalize();
        }
        return movement;
    }

    /** Indica si el controlador ha solicitado un ataque. */
    wantsToAttack() {
        return this.inputController.consumeAttackRequest();
    }

    getManualAttackDirection() {
        const direction = this.inputController.getAttackDirection();
        return direction
            ? new Phaser.Math.Vector2(direction.x, direction.y)
            : undefined;
    }

    getFallbackAttackDirection() {
        return this.lastMovementDirection.clone();
    }

    /** Actualiza entrada, movimiento y solicitudes de ataque del jugador. */
    update(delta: number) {
        const movement = this.inputController.getMovement();
        if (movement.x !== 0 || movement.y !== 0) {
            this.lastMovementDirection.set(movement.x, movement.y).normalize();
            this.tryActivateAbility('movement');
        }
        this.updateAbilities(delta);
        if (!this.active) {
            return;
        }

        if (this.wantsToAttack() && this.getAttackTargets().length > 0) {
            this.tryActivateAbility('auto-aim');
        }
    }
}
