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
