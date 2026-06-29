import { getDatabase } from "../../lib/db";

export function findOrder(platform: string, orderNumber: string) {
  return getDatabase()
    .prepare("select * from orders where platform = ? and order_number = ?")
    .get(platform, orderNumber) as
    | { id: number; play_quota: number; used_plays: number; status: string }
    | undefined;
}

export function consumePlay(orderId: number) {
  getDatabase()
    .prepare("update orders set used_plays = used_plays + 1 where id = ?")
    .run(orderId);
}

export function remainingPlays(order: { play_quota: number; used_plays: number }) {
  return order.play_quota - order.used_plays;
}
