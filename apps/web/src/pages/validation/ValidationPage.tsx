import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startGame } from "../../services/api/client";
import { useCampaignStore } from "../../state/campaignStore";

export function ValidationPage() {
  const navigate = useNavigate();
  const player = useCampaignStore((state) => state.player);
  const setSession = useCampaignStore((state) => state.setSession);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!player) {
      navigate("/form");
      return;
    }

    startGame(player)
      .then((data) => {
        setSession(data.sessionToken, data.remainingPlays);
        navigate("/briefing");
      })
      .catch((cause: Error) => {
        setError(cause.message);
      });
  }, [navigate, player, setSession]);

  return (
    <section className="screen">
      <div className="badge">Step 2</div>
      <h1>Memeriksa Order</h1>
      <p className="subtitle">
        {error ?? "Mencocokkan nomor order dan menyiapkan arena mecha..."}
      </p>
    </section>
  );
}
