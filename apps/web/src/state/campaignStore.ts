import { create } from "zustand";

export type PlayerPayload = {
  whatsapp: string;
  address: string;
  orderNumber: string;
  platform: "shopee" | "tiktok";
};

export type BattleOutcome = "victory" | "defeat" | "draw";

type CampaignState = {
  player?: PlayerPayload;
  sessionToken?: string;
  remainingPlays?: number;
  result?: BattleOutcome;
  setPlayer: (player: PlayerPayload) => void;
  setSession: (sessionToken: string, remainingPlays: number) => void;
  setResult: (result: BattleOutcome) => void;
};

export const useCampaignStore = create<CampaignState>((set) => ({
  setPlayer: (player) => set({ player }),
  setSession: (sessionToken, remainingPlays) => set({ sessionToken, remainingPlays }),
  setResult: (result) => set({ result }),
}));
