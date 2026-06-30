import Phaser from "phaser";
import {
  applyAction,
  initialBattleState,
  type BattleAction,
  type BattleState,
} from "../logic/battleEngine";

type BattleResult = {
  result: "victory" | "defeat" | "draw";
  hpRemaining: number;
  enemyHpRemaining: number;
  durationSeconds: number;
  score: number;
};

type BattleCallbacks = {
  onStateChange: (state: BattleState) => void;
  onFinished: (result: BattleResult) => void;
};

export class BattleScene extends Phaser.Scene {
  private battle = initialBattleState();
  private finished = false;
  private playerSprite?: Phaser.GameObjects.Rectangle;
  private enemySprite?: Phaser.GameObjects.Rectangle;
  private infoText?: Phaser.GameObjects.Text;
  private readonly callbacks: BattleCallbacks;

  constructor(callbacks: BattleCallbacks) {
    super("BattleScene");
    this.callbacks = callbacks;
  }

  create() {
    this.cameras.main.setBackgroundColor("#07111f");
    this.add.rectangle(195, 422, 360, 560, 0x102038, 0.92).setStrokeStyle(2, 0x40d9ff);

    this.playerSprite = this.add.rectangle(110, 520, 72, 96, 0x40d9ff);
    this.enemySprite = this.add.rectangle(280, 320, 72, 96, 0xff6b6b);
    this.infoText = this.add.text(32, 40, "Tap controls to fight", {
      color: "#eff7ff",
      fontSize: "22px",
    });

    const handleWindowAction = (event: Event) => {
      const detail = (event as CustomEvent<BattleAction["type"]>).detail;
      this.handleAction({ actor: "player", type: detail });
    };

    window.addEventListener("battle-action", handleWindowAction as EventListener);
    this.events.once("shutdown", () => {
      window.removeEventListener("battle-action", handleWindowAction as EventListener);
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.finished) {
          return;
        }

        this.battle.timeLeft = Math.max(0, this.battle.timeLeft - 1);
        const enemyAction: BattleAction["type"] =
          this.battle.enemy.energy >= 50 ? "skill" : Phaser.Math.Between(0, 3) === 0 ? "defend" : "attack";

        this.handleAction({ actor: "enemy", type: enemyAction });
      },
    });

    this.callbacks.onStateChange(this.battle);
    this.renderState();
  }

  private handleAction(action: BattleAction) {
    if (this.finished) {
      return;
    }

    this.battle = applyAction(this.battle, action);
    this.renderState();
    this.callbacks.onStateChange(this.battle);

    if (this.battle.enemy.hp <= 0 || this.battle.player.hp <= 0 || this.battle.timeLeft <= 0) {
      this.finishBattle();
    }
  }

  private renderState() {
    if (!this.playerSprite || !this.enemySprite || !this.infoText) {
      return;
    }

    this.playerSprite.x = 40 + this.battle.player.position * 3;
    this.enemySprite.x = 40 + this.battle.enemy.position * 3;
    this.infoText.setText(
      `Player ${this.battle.player.hp} HP  |  Enemy ${this.battle.enemy.hp} HP  |  ${this.battle.timeLeft}s`
    );
  }

  private finishBattle() {
    this.finished = true;

    const result =
      this.battle.enemy.hp === this.battle.player.hp
        ? "draw"
        : this.battle.enemy.hp < this.battle.player.hp
          ? "victory"
          : "defeat";

    this.callbacks.onFinished({
      result,
      hpRemaining: this.battle.player.hp,
      enemyHpRemaining: this.battle.enemy.hp,
      durationSeconds: 45 - this.battle.timeLeft,
      score: this.battle.player.hp * 10 + (result === "victory" ? 200 : 0),
    });
  }
}
