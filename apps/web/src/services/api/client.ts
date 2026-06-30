import type { PlayerPayload } from "../../state/campaignStore";

const API_BASE = "http://localhost:4000/api";

export async function startGame(payload: PlayerPayload) {
  const response = await fetch(`${API_BASE}/game/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message ?? "Gagal memulai game.");
  }

  return (await response.json()) as {
    sessionToken: string;
    remainingPlays: number;
  };
}
