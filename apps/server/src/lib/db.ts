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

export function seedCompletedSession() {
  const db = getDatabase();
  db.prepare(
    "insert into orders (id, platform, order_number, quantity, play_quota, used_plays, status) values (1, 'shopee', 'SPX-002', 2, 2, 1, 'active')"
  ).run();
  db.prepare(
    "insert into players (id, whatsapp, address, platform, order_number) values (1, '08123456789', 'Jl. Merdeka 10', 'shopee', 'SPX-002')"
  ).run();
  db.prepare(
    "insert into game_sessions (id, player_id, order_id, session_token, status, started_at, finished_at) values (1, 1, 1, 'session-1', 'completed', current_timestamp, current_timestamp)"
  ).run();
  db.prepare(
    "insert into battle_results (session_id, result, hp_remaining, enemy_hp_remaining, duration_seconds, score) values (1, 'victory', 70, 0, 31, 850)"
  ).run();
}
