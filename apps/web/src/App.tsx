import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { AdminPage } from "./pages/admin/AdminPage";
import { BriefingPage } from "./pages/briefing/BriefingPage";
import { BattlePage } from "./pages/battle/BattlePage";
import { PlayerFormPage } from "./pages/form/PlayerFormPage";
import { LandingPage } from "./pages/landing/LandingPage";
import { ResultPage } from "./pages/result/ResultPage";
import { ValidationPage } from "./pages/validation/ValidationPage";
import { useCampaignStore } from "./state/campaignStore";

function AppRoutes() {
  const navigate = useNavigate();
  const setPlayer = useCampaignStore((state) => state.setPlayer);
  const result = useCampaignStore((state) => state.result);
  const remainingPlays = useCampaignStore((state) => state.remainingPlays ?? 0);

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStart={() => navigate("/form")} />} />
      <Route
        path="/form"
        element={
          <PlayerFormPage
            onSubmit={(payload) => {
              setPlayer(payload);
              navigate("/validate");
            }}
          />
        }
      />
      <Route path="/validate" element={<ValidationPage />} />
      <Route path="/briefing" element={<BriefingPage />} />
      <Route path="/battle" element={<BattlePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="/result"
        element={<ResultPage result={result ?? "draw"} remainingPlays={remainingPlays} />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
