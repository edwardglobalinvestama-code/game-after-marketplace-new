import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "../../state/campaignStore";

export function BriefingPage() {
  const navigate = useNavigate();
  const remainingPlays = useCampaignStore((state) => state.remainingPlays ?? 0);

  return (
    <section className="screen">
      <div className="badge">Step 3</div>
      <h1>Mission Briefing</h1>
      <p className="subtitle">Kalahkan mecha lawan sebelum waktu habis untuk mencatat hasil.</p>
      <div className="feature-card">
        <p>Sisa kesempatan setelah sesi ini: {remainingPlays}</p>
      </div>
      <button className="primary-button" onClick={() => navigate("/battle")}>
        Masuk Arena
      </button>
    </section>
  );
}
