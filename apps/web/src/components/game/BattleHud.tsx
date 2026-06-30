type Props = {
  playerHp: number;
  enemyHp: number;
  timeLeft: number;
  onAction: (action: "move_left" | "move_right" | "attack" | "defend" | "skill") => void;
};

export function BattleHud({ playerHp, enemyHp, timeLeft, onAction }: Props) {
  return (
    <div className="battle-hud">
      <div className="hud-stats">
        <span>Player HP: {playerHp}</span>
        <span>Enemy HP: {enemyHp}</span>
        <span>Time: {timeLeft}s</span>
      </div>
      <div className="hud-actions">
        <button onClick={() => onAction("move_left")}>Kiri</button>
        <button onClick={() => onAction("move_right")}>Kanan</button>
        <button onClick={() => onAction("attack")}>Attack</button>
        <button onClick={() => onAction("defend")}>Defend</button>
        <button onClick={() => onAction("skill")}>Skill</button>
      </div>
    </div>
  );
}
