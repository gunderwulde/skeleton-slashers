import * as Phaser from 'phaser';
import { Actor } from './Actor';
import { AttackAbility } from '../abilities/AttackAbility';
import { AutoAimAbility } from '../abilities/AutoAimAbility';
import { DeathAbility } from '../abilities/DeathAbility';
import { HitAbility } from '../abilities/HitAbility';
import { MovementAbility } from '../abilities/MovementAbility';
import { KeyboardMouseController, UserInputController } from '../input/UserInputController';

/** User-controlled actor equipped with a basic attack. */
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
        this.grantAbility(new HitAbility());
        this.grantAbility(new MovementAbility());
        this.grantAbility(new AutoAimAbility());
        this.grantAbility(new DeathAbility());
        this.grantAbility(new AttackAbility());
    }

    setTargets(targets: Actor[]) {
        this.targets = targets;
    }

    getAttackTargets(): Actor[] {
        return this.targets;
    }

    getMovementInput(): { x: number; y: number } {
        const movement = this.inputController.getMovement();
        if (movement.x !== 0 || movement.y !== 0) {
            this.lastMovementDirection.set(movement.x, movement.y).normalize();
        }
        return movement;
    }

    /** Returns whether the controller requested an attack. */
    wantsToAttack() {
        return this.inputController.consumeAttackRequest();
    }

    getManualAttackDirection(): Phaser.Math.Vector2 | undefined {
        const direction = this.inputController.getAttackDirection();
        return direction
            ? new Phaser.Math.Vector2(direction.x, direction.y)
            : undefined;
    }

    getFallbackAttackDirection(): Phaser.Math.Vector2 {
        return this.lastMovementDirection.clone();
    }

    /** Updates input, movement, and player attack requests. */
    update(delta: number) {
        const movement = this.getMovementInput();
        if (movement.x !== 0 || movement.y !== 0) {
            this.tryActivateAbility('movement');
        } else {
            this.tryCancelAbility('movement');
        }
        this.updateAbilities(delta);
        if (movement.x !== 0 || movement.y !== 0) {
            this.tryActivateAbility('movement');
        }
        if (!this.active) {
            return;
        }

        if (this.wantsToAttack() && this.getAttackTargets().length > 0) {
            this.tryActivateAbility('auto-aim');
        }
    }
}
