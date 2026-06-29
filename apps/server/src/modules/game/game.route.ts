import { Router } from "express";
import { z } from "zod";
import { consumePlay, findOrder, remainingPlays } from "../orders/order.service";
import { createPlayer, createSession } from "../sessions/session.repository";
import { hasActiveSession } from "../sessions/session.service";

const gameStartSchema = z.object({
  whatsapp: z.string().min(8),
  address: z.string().min(8),
  platform: z.enum(["shopee", "tiktok"]),
  orderNumber: z.string().min(3),
});

export const gameRouter = Router();

gameRouter.post("/start", (request, response) => {
  const payload = gameStartSchema.parse(request.body);
  const order = findOrder(payload.platform, payload.orderNumber);

  if (!order) {
    response.status(404).json({ message: "Nomor order tidak ditemukan." });
    return;
  }

  if (remainingPlays(order) <= 0) {
    response.status(409).json({ message: "Kuota bermain untuk order ini sudah habis." });
    return;
  }

  if (hasActiveSession(order.id)) {
    response.status(409).json({ message: "Order ini sedang dipakai pada sesi game aktif." });
    return;
  }

  const playerId = createPlayer(payload);
  consumePlay(order.id);
  const sessionToken = createSession(playerId, order.id);

  response.json({
    sessionToken,
    remainingPlays: remainingPlays({
      play_quota: order.play_quota,
      used_plays: order.used_plays + 1,
    }),
  });
});
