import { describe, expect, it } from "vitest";
import { applyAction, initialBattleState } from "./battleEngine";

describe("battleEngine", () => {
  it("reduces enemy HP when attack lands", () => {
    const state = initialBattleState();
    const next = applyAction(state, { actor: "player", type: "attack" });

    expect(next.enemy.hp).toBe(88);
    expect(next.player.energy).toBe(15);
  });

  it("reduces incoming damage when defend is active", () => {
    const state = applyAction(initialBattleState(), { actor: "player", type: "defend" });
    const next = applyAction(state, { actor: "enemy", type: "attack" });

    expect(next.player.hp).toBe(95);
  });
});
