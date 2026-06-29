import { getDatabase } from "../../lib/db";

export function hasActiveSession(orderId: number) {
  const row = getDatabase()
    .prepare("select id from game_sessions where order_id = ? and status = 'active'")
    .get(orderId) as { id: number } | undefined;

  return Boolean(row);
}
