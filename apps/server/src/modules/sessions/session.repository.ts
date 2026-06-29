import { randomUUID } from "node:crypto";
import { getDatabase } from "../../lib/db";

export function createPlayer(data: {
  whatsapp: string;
  address: string;
  platform: string;
  orderNumber: string;
}) {
  const result = getDatabase()
    .prepare(
      "insert into players (whatsapp, address, platform, order_number) values (?, ?, ?, ?)"
    )
    .run(data.whatsapp, data.address, data.platform, data.orderNumber);

  return Number(result.lastInsertRowid);
}

export function createSession(playerId: number, orderId: number) {
  const token = randomUUID();

  getDatabase()
    .prepare(
      "insert into game_sessions (player_id, order_id, session_token, status, started_at) values (?, ?, ?, 'active', current_timestamp)"
    )
    .run(playerId, orderId, token);

  return token;
}
