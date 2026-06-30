import { Router } from "express";
import { z } from "zod";
import { getDatabase } from "../../lib/db";
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

gameRouter.post("/result", (request, response) => {
  const body = z
    .object({
      sessionToken: z.string(),
      result: z.enum(["victory", "defeat", "draw"]),
      hpRemaining: z.number().int().min(0).max(100),
      enemyHpRemaining: z.number().int().min(0).max(100),
      durationSeconds: z.number().int().positive(),
      score: z.number().int().nonnegative(),
    })
    .parse(request.body);

  const db = getDatabase();
  const session = db
    .prepare("select id from game_sessions where session_token = ? and status = 'active'")
    .get(body.sessionToken) as { id: number } | undefined;

  if (!session) {
    response.status(409).json({ message: "Sesi game tidak valid." });
    return;
  }

  db.prepare(
    "insert into battle_results (session_id, result, hp_remaining, enemy_hp_remaining, duration_seconds, score) values (?, ?, ?, ?, ?, ?)"
  ).run(
    session.id,
    body.result,
    body.hpRemaining,
    body.enemyHpRemaining,
    body.durationSeconds,
    body.score
  );

  db.prepare(
    "update game_sessions set status = 'completed', finished_at = current_timestamp where id = ?"
  ).run(session.id);

  response.json({ saved: true });
});
