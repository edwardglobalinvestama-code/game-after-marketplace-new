import { getDatabase } from "../../lib/db";
import type { ImportedOrder } from "../imports/import.service";

export function upsertOrders(orders: ImportedOrder[]) {
  const db = getDatabase();
  const statement = db.prepare(`
    insert into orders (platform, order_number, quantity, play_quota, used_plays, status)
    values (@platform, @orderNumber, @quantity, @quantity, 0, 'active')
    on conflict(platform, order_number) do update set
      quantity = excluded.quantity,
      play_quota = excluded.play_quota
  `);

  const transaction = db.transaction((rows: ImportedOrder[]) => {
    for (const row of rows) {
      statement.run(row);
    }
  });

  transaction(orders);
}

export function listOrders(platform?: string) {
  const db = getDatabase();
  const rows = platform
    ? db.prepare("select * from orders where platform = ? order by id desc").all(platform)
    : db.prepare("select * from orders order by id desc").all();

  return rows.map((row: any) => ({
    orderNumber: row.order_number,
    quantity: row.quantity,
    playQuota: row.play_quota,
    usedPlays: row.used_plays,
    platform: row.platform,
  }));
}
