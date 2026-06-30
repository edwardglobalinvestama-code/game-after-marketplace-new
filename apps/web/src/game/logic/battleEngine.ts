export type Combatant = {
  hp: number;
  energy: number;
  defending: boolean;
  position: number;
};

export type BattleState = {
  player: Combatant;
  enemy: Combatant;
  timeLeft: number;
};

export type BattleAction = {
  actor: "player" | "enemy";
  type: "attack" | "defend" | "skill" | "move_left" | "move_right";
};

export function initialBattleState(): BattleState {
  return {
    player: { hp: 100, energy: 0, defending: false, position: 25 },
    enemy: { hp: 100, energy: 0, defending: false, position: 75 },
    timeLeft: 45,
  };
}

export function applyAction(state: BattleState, action: BattleAction): BattleState {
  const next = structuredClone(state);
  const attacker = action.actor === "player" ? next.player : next.enemy;
  const defender = action.actor === "player" ? next.enemy : next.player;

  if (action.type === "move_left") {
    attacker.position = Math.max(10, attacker.position - 8);
    return next;
  }

  if (action.type === "move_right") {
    attacker.position = Math.min(90, attacker.position + 8);
    return next;
  }

  if (action.type === "defend") {
    attacker.defending = true;
    return next;
  }

  const rawDamage = action.type === "skill" ? 22 : 12;
  const appliedDamage = defender.defending
    ? action.type === "skill"
      ? 10
      : 5
    : rawDamage;

  defender.hp = Math.max(0, defender.hp - appliedDamage);
  defender.defending = false;
  attacker.energy = Math.min(100, action.type === "skill" ? attacker.energy : attacker.energy + 15);

  if (action.type === "skill") {
    attacker.energy = Math.max(0, attacker.energy - 50);
  }

  return next;
}
