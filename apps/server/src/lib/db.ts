import Database from "better-sqlite3";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

let database = new Database("mecha-promo.db");

function applySchema(db: Database.Database) {
  const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
  db.exec(fs.readFileSync(schemaPath, "utf8"));
}

applySchema(database);

export function getDatabase() {
  return database;
}

export function resetDatabase(filename: string) {
  database.close();
  database = new Database(filename);
  applySchema(database);
}

export function seedOrder(order: {
  platform: string;
  orderNumber: string;
  quantity: number;
  playQuota: number;
  usedPlays: number;
}) {
  getDatabase()
    .prepare(
      "insert into orders (platform, order_number, quantity, play_quota, used_plays, status) values (?, ?, ?, ?, ?, 'active')"
    )
    .run(order.platform, order.orderNumber, order.quantity, order.playQuota, order.usedPlays);
}
