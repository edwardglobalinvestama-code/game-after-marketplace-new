import { useEffect, useState } from "react";
import Phaser from "phaser";
import { useNavigate } from "react-router-dom";
import { BattleHud } from "../../components/game/BattleHud";
import { BattleScene } from "../../game/scenes/BattleScene";
import { useCampaignStore } from "../../state/campaignStore";

export function BattlePage() {
  const navigate = useNavigate();
  const sessionToken = useCampaignStore((state) => state.sessionToken);
  const setResult = useCampaignStore((state) => state.setResult);
  const [hud, setHud] = useState({
    playerHp: 100,
    enemyHp: 100,
    timeLeft: 45,
  });

  useEffect(() => {
    if (!sessionToken) {
      navigate("/form");
      return;
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 390,
      height: 640,
      parent: "battle-root",
      backgroundColor: "#07111f",
      scene: [
        new BattleScene({
          onStateChange: (state) =>
            setHud({
              playerHp: state.player.hp,
              enemyHp: state.enemy.hp,
              timeLeft: state.timeLeft,
            }),
          onFinished: async (result) => {
            try {
              await fetch("http://localhost:4000/api/game/result", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionToken, ...result }),
              });
            } finally {
              setResult(result.result);
              navigate("/result");
            }
          },
        }),
      ],
    });

    return () => {
      game.destroy(true);
    };
  }, [navigate, sessionToken, setResult]);

  function sendAction(action: "move_left" | "move_right" | "attack" | "defend" | "skill") {
    window.dispatchEvent(new CustomEvent("battle-action", { detail: action }));
  }

  return (
    <section className="screen battle-screen">
      <div id="battle-root" className="battle-root" />
      <BattleHud
        playerHp={hud.playerHp}
        enemyHp={hud.enemyHp}
        timeLeft={hud.timeLeft}
        onAction={sendAction}
      />
    </section>
  );
}
