# Mecha Promo Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable web promo game where QR visitors validate a Shopee/TikTok order from admin-imported data, consume play quota based on purchase quantity, fight one mecha battle, and log the result.

**Architecture:** Use a monorepo with `apps/web` for the React mobile-first promo/game client and `apps/server` for the Express API. Keep battle rules in pure TypeScript modules so they can be tested independently from Phaser rendering, and keep order validation/session logic in small backend modules backed by SQLite.

**Tech Stack:** npm workspaces, Vite, React, TypeScript, Phaser, Zustand, Express, Zod, better-sqlite3, Multer, xlsx, Vitest, Testing Library, Supertest

---

## File Map

### Root

- `package.json` — workspace scripts for dev, build, and test
- `tsconfig.base.json` — shared TypeScript settings
- `.gitignore` — ignores dependencies, build outputs, SQLite files, and local env

### Web App

- `apps/web/package.json` — frontend dependencies and scripts
- `apps/web/src/main.tsx` — app entry point
- `apps/web/src/App.tsx` — top-level route shell
- `apps/web/src/state/campaignStore.ts` — session token, player form data, and result state
- `apps/web/src/services/api/client.ts` — typed fetch helpers
- `apps/web/src/pages/landing/LandingPage.tsx` — promo landing
- `apps/web/src/pages/form/PlayerFormPage.tsx` — customer data form
- `apps/web/src/pages/validation/ValidationPage.tsx` — server validation and routing
- `apps/web/src/pages/briefing/BriefingPage.tsx` — pre-battle mission briefing
- `apps/web/src/pages/battle/BattlePage.tsx` — game screen host
- `apps/web/src/pages/result/ResultPage.tsx` — result and follow-up messaging
- `apps/web/src/game/logic/battleEngine.ts` — pure battle state transitions
- `apps/web/src/game/scenes/BattleScene.ts` — Phaser scene with controls and effects
- `apps/web/src/components/game/BattleHud.tsx` — HP bars, controls, timer
- `apps/web/src/styles/theme.css` — modern sci-fi visual tokens

### Server App

- `apps/server/package.json` — backend dependencies and scripts
- `apps/server/src/app.ts` — Express app factory
- `apps/server/src/index.ts` — server bootstrap
- `apps/server/src/lib/db.ts` — SQLite connection and schema bootstrap
- `apps/server/src/lib/schema.sql` — table definitions
- `apps/server/src/modules/health/health.route.ts` — health endpoint
- `apps/server/src/modules/imports/import.route.ts` — admin upload endpoint
- `apps/server/src/modules/imports/import.service.ts` — normalize Shopee/TikTok exports
- `apps/server/src/modules/orders/order.repository.ts` — read/write order records
- `apps/server/src/modules/orders/order.service.ts` — validation and quota calculations
- `apps/server/src/modules/sessions/session.repository.ts` — session persistence
- `apps/server/src/modules/sessions/session.service.ts` — create and close sessions safely
- `apps/server/src/modules/game/game.route.ts` — validate order, start session, submit result
- `apps/server/src/modules/admin/admin.route.ts` — order/session listing for admin

### Tests

- `apps/server/tests/health.test.ts`
- `apps/server/tests/order-import.test.ts`
- `apps/server/tests/session-flow.test.ts`
- `apps/server/tests/admin-session.test.ts`
- `apps/web/src/pages/form/PlayerFormPage.test.tsx`
- `apps/web/src/game/logic/battleEngine.test.ts`
- `apps/web/src/pages/result/ResultPage.test.tsx`

## Task 1: Bootstrap Workspace And Health Check

**Files:**
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/.gitignore`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/package.json`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/tsconfig.base.json`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/package.json`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/tsconfig.json`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/app.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/index.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/health/health.route.ts`
- Test: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/tests/health.test.ts`

- [ ] **Step 1: Initialize git and workspace folders**

Run:

```bash
git init
mkdir apps
mkdir apps\web
mkdir apps\server
mkdir apps\server\src
mkdir apps\server\src\modules
mkdir apps\server\tests
```

Expected: repository initialized and folders created without errors.

- [ ] **Step 2: Add root workspace config**

```json
{
  "name": "mecha-promo-game",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev:web": "npm run dev --workspace @mecha/web",
    "dev:server": "npm run dev --workspace @mecha/server",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

Also add `.gitignore`:

```gitignore
node_modules/
dist/
coverage/
*.db
*.sqlite
.env
.DS_Store
```

And `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 3: Write the failing backend health test**

```ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("GET /api/health", () => {
  it("returns ok status", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 4: Run the health test to verify it fails**

Run:

```bash
npm install
npm install --workspace @mecha/server express cors zod
npm install -D --workspace @mecha/server typescript tsx vitest supertest @types/express @types/supertest
npm test --workspace @mecha/server -- health.test.ts
```

Expected: FAIL because `createApp` and `/api/health` do not exist yet.

- [ ] **Step 5: Implement the minimal server app and health route**

`apps/server/package.json`

```json
{
  "name": "@mecha/server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  }
}
```

`apps/server/src/modules/health/health.route.ts`

```ts
import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({ status: "ok" });
});
```

`apps/server/src/app.ts`

```ts
import cors from "cors";
import express from "express";
import { healthRouter } from "./modules/health/health.route";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/health", healthRouter);

  return app;
}
```

`apps/server/src/index.ts`

```ts
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4000);

createApp().listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
```

- [ ] **Step 6: Run the health test to verify it passes**

Run:

```bash
npm test --workspace @mecha/server -- health.test.ts
```

Expected: PASS with `1 passed`.

- [ ] **Step 7: Commit bootstrap**

```bash
git add .gitignore package.json tsconfig.base.json apps/server
git commit -m "chore: bootstrap workspace and server health check"
```

## Task 2: Add Database Schema And Order Import Pipeline

**Files:**
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/lib/schema.sql`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/lib/db.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/imports/import.route.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/imports/import.service.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/orders/order.repository.ts`
- Test: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/tests/order-import.test.ts`
- Modify: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/app.ts`

- [ ] **Step 1: Write the failing import test**

```ts
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { resetDatabase } from "../src/lib/db";

describe("POST /api/admin/imports/orders", () => {
  beforeEach(() => {
    resetDatabase(":memory:");
  });

  it("stores play quota from imported quantity", async () => {
    const csv = [
      "order_number,quantity",
      "SPX-001,3"
    ].join("\n");

    const response = await request(createApp())
      .post("/api/admin/imports/orders")
      .field("platform", "shopee")
      .attach("file", Buffer.from(csv), "orders.csv");

    expect(response.status).toBe(200);
    expect(response.body.summary).toEqual({
      platform: "shopee",
      importedOrders: 1
    });

    const check = await request(createApp())
      .get("/api/admin/orders")
      .query({ platform: "shopee" });

    expect(check.body.orders[0]).toMatchObject({
      orderNumber: "SPX-001",
      quantity: 3,
      playQuota: 3,
      usedPlays: 0
    });
  });
});
```

- [ ] **Step 2: Run the import test to verify it fails**

Run:

```bash
npm install --workspace @mecha/server better-sqlite3 multer xlsx
npm install -D --workspace @mecha/server @types/multer
npm test --workspace @mecha/server -- order-import.test.ts
```

Expected: FAIL because the database, import route, and admin order listing do not exist.

- [ ] **Step 3: Implement schema bootstrap and import service**

`apps/server/src/lib/schema.sql`

```sql
create table if not exists orders (
  id integer primary key autoincrement,
  platform text not null,
  order_number text not null,
  quantity integer not null,
  play_quota integer not null,
  used_plays integer not null default 0,
  status text not null default 'active',
  unique(platform, order_number)
);

create table if not exists players (
  id integer primary key autoincrement,
  whatsapp text not null,
  address text not null,
  platform text not null,
  order_number text not null,
  created_at text not null default current_timestamp
);

create table if not exists game_sessions (
  id integer primary key autoincrement,
  player_id integer not null,
  order_id integer not null,
  session_token text not null unique,
  status text not null,
  started_at text,
  finished_at text
);

create table if not exists battle_results (
  id integer primary key autoincrement,
  session_id integer not null unique,
  result text not null,
  hp_remaining integer not null,
  enemy_hp_remaining integer not null,
  duration_seconds integer not null,
  score integer not null
);
```

`apps/server/src/lib/db.ts`

```ts
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
```

`apps/server/src/modules/imports/import.service.ts`

```ts
import XLSX from "xlsx";

export type ImportedOrder = {
  platform: "shopee" | "tiktok";
  orderNumber: string;
  quantity: number;
};

export function parseImportedOrders(
  platform: "shopee" | "tiktok",
  fileBuffer: Buffer,
  filename: string
): ImportedOrder[] {
  if (filename.endsWith(".csv")) {
    const rows = fileBuffer.toString("utf8").trim().split(/\r?\n/);
    return rows.slice(1).map((line) => {
      const [orderNumber, quantity] = line.split(",");
      return { platform, orderNumber, quantity: Number(quantity) };
    });
  }

  const workbook = XLSX.read(fileBuffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<{ order_number: string; quantity: number }>(sheet);
  return rows.map((row) => ({
    platform,
    orderNumber: row.order_number,
    quantity: Number(row.quantity)
  }));
}
```

`apps/server/src/modules/orders/order.repository.ts`

```ts
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
    for (const row of rows) statement.run(row);
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
    platform: row.platform
  }));
}
```

- [ ] **Step 4: Wire the import and admin routes**

`apps/server/src/modules/imports/import.route.ts`

```ts
import multer from "multer";
import { Router } from "express";
import { upsertOrders } from "../orders/order.repository";
import { parseImportedOrders } from "./import.service";

const upload = multer();
export const importRouter = Router();

importRouter.post("/orders", upload.single("file"), (request, response) => {
  const platform = request.body.platform as "shopee" | "tiktok";
  const file = request.file;

  if (!file || !platform) {
    return response.status(400).json({ message: "platform and file are required" });
  }

  const orders = parseImportedOrders(platform, file.buffer, file.originalname);
  upsertOrders(orders);

  response.json({
    summary: {
      platform,
      importedOrders: orders.length
    }
  });
});
```

Add to `apps/server/src/app.ts`:

```ts
import { importRouter } from "./modules/imports/import.route";
import { listOrders } from "./modules/orders/order.repository";

app.use("/api/admin/imports", importRouter);
app.get("/api/admin/orders", (request, response) => {
  response.json({ orders: listOrders(request.query.platform as string | undefined) });
});
```

- [ ] **Step 5: Run the import test to verify it passes**

Run:

```bash
npm test --workspace @mecha/server -- order-import.test.ts
```

Expected: PASS with `1 passed`.

- [ ] **Step 6: Commit import pipeline**

```bash
git add apps/server
git commit -m "feat: import marketplace orders with play quota"
```

## Task 3: Implement Order Validation And Session Start API

**Files:**
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/orders/order.service.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/sessions/session.repository.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/sessions/session.service.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/game/game.route.ts`
- Test: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/tests/session-flow.test.ts`
- Modify: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/app.ts`

- [ ] **Step 1: Write the failing session flow test**

```ts
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { resetDatabase, seedOrder } from "../src/lib/db";

describe("POST /api/game/start", () => {
  beforeEach(() => {
    resetDatabase(":memory:");
    seedOrder({
      platform: "shopee",
      orderNumber: "SPX-002",
      quantity: 2,
      playQuota: 2,
      usedPlays: 0
    });
  });

  it("creates a game session and consumes one remaining play", async () => {
    const response = await request(createApp()).post("/api/game/start").send({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      platform: "shopee",
      orderNumber: "SPX-002"
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      sessionToken: expect.any(String),
      remainingPlays: 1
    });
  });

  it("rejects an order whose quota is already used", async () => {
    resetDatabase(":memory:");
    seedOrder({
      platform: "shopee",
      orderNumber: "SPX-999",
      quantity: 1,
      playQuota: 1,
      usedPlays: 1
    });

    const response = await request(createApp()).post("/api/game/start").send({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      platform: "shopee",
      orderNumber: "SPX-999"
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Kuota bermain untuk order ini sudah habis.");
  });

  it("rejects a second active session for the same order", async () => {
    await request(createApp()).post("/api/game/start").send({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      platform: "shopee",
      orderNumber: "SPX-002"
    });

    const second = await request(createApp()).post("/api/game/start").send({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      platform: "shopee",
      orderNumber: "SPX-002"
    });

    expect(second.status).toBe(409);
    expect(second.body.message).toBe("Order ini sedang dipakai pada sesi game aktif.");
  });
});
```

- [ ] **Step 2: Run the session flow test to verify it fails**

Run:

```bash
npm test --workspace @mecha/server -- session-flow.test.ts
```

Expected: FAIL because `seedOrder`, validation logic, and `/api/game/start` do not exist.

- [ ] **Step 3: Add order lookup and quota consumption helpers**

`apps/server/src/modules/orders/order.service.ts`

```ts
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
```

`apps/server/src/modules/sessions/session.repository.ts`

```ts
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
```

`apps/server/src/modules/sessions/session.service.ts`

```ts
import { getDatabase } from "../../lib/db";

export function hasActiveSession(orderId: number) {
  const row = getDatabase()
    .prepare("select id from game_sessions where order_id = ? and status = 'active'")
    .get(orderId) as { id: number } | undefined;

  return Boolean(row);
}
```

- [ ] **Step 4: Implement the game start route**

`apps/server/src/modules/game/game.route.ts`

```ts
import { Router } from "express";
import { z } from "zod";
import { consumePlay, findOrder, remainingPlays } from "../orders/order.service";
import { createPlayer, createSession } from "../sessions/session.repository";
import { hasActiveSession } from "../sessions/session.service";

const gameStartSchema = z.object({
  whatsapp: z.string().min(8),
  address: z.string().min(8),
  platform: z.enum(["shopee", "tiktok"]),
  orderNumber: z.string().min(3)
});

export const gameRouter = Router();

gameRouter.post("/start", (request, response) => {
  const payload = gameStartSchema.parse(request.body);
  const order = findOrder(payload.platform, payload.orderNumber);

  if (!order) {
    return response.status(404).json({ message: "Nomor order tidak ditemukan." });
  }

  if (remainingPlays(order) <= 0) {
    return response
      .status(409)
      .json({ message: "Kuota bermain untuk order ini sudah habis." });
  }

  if (hasActiveSession(order.id)) {
    return response
      .status(409)
      .json({ message: "Order ini sedang dipakai pada sesi game aktif." });
  }

  const playerId = createPlayer(payload);
  consumePlay(order.id);
  const sessionToken = createSession(playerId, order.id);

  response.json({
    sessionToken,
    remainingPlays: remainingPlays({
      play_quota: order.play_quota,
      used_plays: order.used_plays + 1
    })
  });
});
```

Add to `apps/server/src/app.ts`:

```ts
import { gameRouter } from "./modules/game/game.route";

app.use("/api/game", gameRouter);
```

Add test helper to `apps/server/src/lib/db.ts`:

```ts
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
```

- [ ] **Step 5: Run the session flow test to verify it passes**

Run:

```bash
npm test --workspace @mecha/server -- session-flow.test.ts
```

Expected: PASS with `3 passed`.

- [ ] **Step 6: Commit validation and sessions**

```bash
git add apps/server
git commit -m "feat: validate orders and create game sessions"
```

## Task 4: Build Frontend Promo Flow Up To Battle Entry

**Files:**
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/package.json`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/tsconfig.json`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/index.html`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/main.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/App.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/state/campaignStore.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/services/api/client.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/landing/LandingPage.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/form/PlayerFormPage.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/validation/ValidationPage.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/briefing/BriefingPage.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/styles/theme.css`
- Test: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/form/PlayerFormPage.test.tsx`

- [ ] **Step 1: Write the failing form test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayerFormPage } from "./PlayerFormPage";

describe("PlayerFormPage", () => {
  it("submits order data to the parent callback", () => {
    const onSubmit = vi.fn();

    render(<PlayerFormPage onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/whatsapp/i), {
      target: { value: "08123456789" }
    });
    fireEvent.change(screen.getByLabelText(/alamat/i), {
      target: { value: "Jl. Merdeka 10" }
    });
    fireEvent.change(screen.getByLabelText(/nomor order/i), {
      target: { value: "SPX-002" }
    });
    fireEvent.change(screen.getByLabelText(/platform/i), {
      target: { value: "shopee" }
    });

    fireEvent.click(screen.getByRole("button", { name: /mulai misi/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      orderNumber: "SPX-002",
      platform: "shopee"
    });
  });
});
```

- [ ] **Step 2: Run the form test to verify it fails**

Run:

```bash
npm create vite@latest apps/web -- --template react-ts
npm install --workspace @mecha/web react-router-dom zustand phaser
npm install -D --workspace @mecha/web vitest @testing-library/react @testing-library/jest-dom jsdom
npm test --workspace @mecha/web -- PlayerFormPage.test.tsx
```

Expected: FAIL because the tested component does not exist yet.

- [ ] **Step 3: Add app shell, store, and API client**

`apps/web/package.json`

```json
{
  "name": "@mecha/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run"
  }
}
```

`apps/web/src/state/campaignStore.ts`

```ts
import { create } from "zustand";

export type PlayerPayload = {
  whatsapp: string;
  address: string;
  orderNumber: string;
  platform: "shopee" | "tiktok";
};

type CampaignState = {
  player?: PlayerPayload;
  sessionToken?: string;
  remainingPlays?: number;
  setPlayer: (player: PlayerPayload) => void;
  setSession: (sessionToken: string, remainingPlays: number) => void;
};

export const useCampaignStore = create<CampaignState>((set) => ({
  setPlayer: (player) => set({ player }),
  setSession: (sessionToken, remainingPlays) => set({ sessionToken, remainingPlays })
}));
```

`apps/web/src/services/api/client.ts`

```ts
import type { PlayerPayload } from "../state/campaignStore";

const API_BASE = "http://localhost:4000/api";

export async function startGame(payload: PlayerPayload) {
  const response = await fetch(`${API_BASE}/game/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Gagal memulai game.");
  }

  return response.json() as Promise<{ sessionToken: string; remainingPlays: number }>;
}
```

- [ ] **Step 4: Implement landing, form, validation, and briefing pages**

`apps/web/src/pages/form/PlayerFormPage.tsx`

```tsx
import { FormEvent, useState } from "react";
import type { PlayerPayload } from "../../state/campaignStore";

type Props = {
  onSubmit: (payload: PlayerPayload) => void;
};

export function PlayerFormPage({ onSubmit }: Props) {
  const [form, setForm] = useState<PlayerPayload>({
    whatsapp: "",
    address: "",
    orderNumber: "",
    platform: "shopee"
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        WhatsApp
        <input
          aria-label="WhatsApp"
          value={form.whatsapp}
          onChange={(event) => setForm({ ...form, whatsapp: event.target.value })}
        />
      </label>
      <label>
        Alamat
        <input
          aria-label="Alamat"
          value={form.address}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
        />
      </label>
      <label>
        Nomor Order
        <input
          aria-label="Nomor Order"
          value={form.orderNumber}
          onChange={(event) => setForm({ ...form, orderNumber: event.target.value })}
        />
      </label>
      <label>
        Platform
        <select
          aria-label="Platform"
          value={form.platform}
          onChange={(event) =>
            setForm({ ...form, platform: event.target.value as "shopee" | "tiktok" })
          }
        >
          <option value="shopee">Shopee</option>
          <option value="tiktok">TikTok Shop</option>
        </select>
      </label>
      <button type="submit">Mulai Misi</button>
    </form>
  );
}
```

`apps/web/src/App.tsx`

```tsx
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { BriefingPage } from "./pages/briefing/BriefingPage";
import { PlayerFormPage } from "./pages/form/PlayerFormPage";
import { LandingPage } from "./pages/landing/LandingPage";
import { ValidationPage } from "./pages/validation/ValidationPage";
import { useCampaignStore } from "./state/campaignStore";

function AppRoutes() {
  const navigate = useNavigate();
  const setPlayer = useCampaignStore((state) => state.setPlayer);

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStart={() => navigate("/form")} />} />
      <Route
        path="/form"
        element={
          <PlayerFormPage
            onSubmit={(payload) => {
              setPlayer(payload);
              navigate("/validate");
            }}
          />
        }
      />
      <Route path="/validate" element={<ValidationPage />} />
      <Route path="/briefing" element={<BriefingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
```

`apps/web/src/pages/validation/ValidationPage.tsx`

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startGame } from "../../services/api/client";
import { useCampaignStore } from "../../state/campaignStore";

export function ValidationPage() {
  const navigate = useNavigate();
  const player = useCampaignStore((state) => state.player);
  const setSession = useCampaignStore((state) => state.setSession);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!player) {
      navigate("/form");
      return;
    }

    startGame(player)
      .then((data) => {
        setSession(data.sessionToken, data.remainingPlays);
        navigate("/briefing");
      })
      .catch((cause: Error) => setError(cause.message));
  }, [navigate, player, setSession]);

  if (error) return <p>{error}</p>;
  return <p>Memverifikasi order dan menyiapkan mecha...</p>;
}
```

`apps/web/src/pages/briefing/BriefingPage.tsx`

```tsx
import { useNavigate } from "react-router-dom";

export function BriefingPage() {
  const navigate = useNavigate();

  return (
    <section>
      <h1>Mission Briefing</h1>
      <p>Kalahkan mecha lawan sebelum waktu habis.</p>
      <button onClick={() => navigate("/battle")}>Masuk Arena</button>
    </section>
  );
}
```

- [ ] **Step 5: Run the form test to verify it passes**

Run:

```bash
npm test --workspace @mecha/web -- PlayerFormPage.test.tsx
```

Expected: PASS with `1 passed`.

- [ ] **Step 6: Commit promo entry flow**

```bash
git add apps/web
git commit -m "feat: add promo landing and validation flow"
```

## Task 5: Implement Battle Logic And Result Submission

**Files:**
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/game/logic/battleEngine.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/game/scenes/BattleScene.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/components/game/BattleHud.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/battle/BattlePage.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/result/ResultPage.tsx`
- Modify: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/App.tsx`
- Modify: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/state/campaignStore.ts`
- Modify: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/game/game.route.ts`
- Test: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/game/logic/battleEngine.test.ts`
- Test: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/result/ResultPage.test.tsx`

- [ ] **Step 1: Write the failing battle engine test**

```ts
import { describe, expect, it } from "vitest";
import { applyAction, initialBattleState } from "./battleEngine";

describe("battleEngine", () => {
  it("reduces enemy HP when attack lands", () => {
    const state = initialBattleState();
    const next = applyAction(state, { actor: "player", type: "attack" });

    expect(next.enemy.hp).toBe(88);
    expect(next.player.energy).toBe(15);
  });

  it("reduces incoming damage when defend is active", () => {
    const state = applyAction(initialBattleState(), { actor: "player", type: "defend" });
    const next = applyAction(state, { actor: "enemy", type: "attack" });

    expect(next.player.hp).toBe(95);
  });
});
```

- [ ] **Step 2: Run the battle test to verify it fails**

Run:

```bash
npm test --workspace @mecha/web -- battleEngine.test.ts
```

Expected: FAIL because the engine does not exist yet.

- [ ] **Step 3: Implement the pure battle engine**

`apps/web/src/game/logic/battleEngine.ts`

```ts
export type Combatant = {
  hp: number;
  energy: number;
  defending: boolean;
};

export type BattleState = {
  player: Combatant;
  enemy: Combatant;
  timeLeft: number;
};

export type BattleAction = {
  actor: "player" | "enemy";
  type: "attack" | "defend" | "skill";
};

export function initialBattleState(): BattleState {
  return {
    player: { hp: 100, energy: 0, defending: false },
    enemy: { hp: 100, energy: 0, defending: false },
    timeLeft: 45
  };
}

export function applyAction(state: BattleState, action: BattleAction): BattleState {
  const next = structuredClone(state);
  const attacker = action.actor === "player" ? next.player : next.enemy;
  const defender = action.actor === "player" ? next.enemy : next.player;

  next.player.defending = false;
  next.enemy.defending = false;

  if (action.type === "defend") {
    attacker.defending = true;
    return next;
  }

  const rawDamage = action.type === "skill" ? 22 : 12;
  const appliedDamage = defender.defending ? Math.ceil(rawDamage / 2) : rawDamage;
  defender.hp = Math.max(0, defender.hp - appliedDamage);
  attacker.energy = Math.min(100, attacker.energy + 15);

  return next;
}
```

- [ ] **Step 4: Add Phaser scene and result submission route**

In `apps/server/src/modules/game/game.route.ts`, add:

```ts
import { getDatabase } from "../../lib/db";

gameRouter.post("/result", (request, response) => {
  const body = z
    .object({
      sessionToken: z.string(),
      result: z.enum(["victory", "defeat", "draw"]),
      hpRemaining: z.number().int().min(0).max(100),
      enemyHpRemaining: z.number().int().min(0).max(100),
      durationSeconds: z.number().int().positive(),
      score: z.number().int().nonnegative()
    })
    .parse(request.body);

  const db = getDatabase();
  const session = db
    .prepare("select id from game_sessions where session_token = ? and status = 'active'")
    .get(body.sessionToken) as { id: number } | undefined;

  if (!session) {
    return response.status(409).json({ message: "Sesi game tidak valid." });
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
```

In `apps/web/src/pages/battle/BattlePage.tsx`, host a Phaser scene and post the final result once:

```tsx
import { useEffect } from "react";
import Phaser from "phaser";
import { useNavigate } from "react-router-dom";
import { BattleScene } from "../../game/scenes/BattleScene";
import { useCampaignStore } from "../../state/campaignStore";

export function BattlePage() {
  const navigate = useNavigate();
  const sessionToken = useCampaignStore((state) => state.sessionToken);
  const setResult = useCampaignStore((state) => state.setResult);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 390,
      height: 844,
      parent: "battle-root",
      scene: [new BattleScene({
        onFinished: async (result) => {
          await fetch("http://localhost:4000/api/game/result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken, ...result })
          });
          setResult(result.result);
          navigate("/result");
        }
      })]
    });

    return () => game.destroy(true);
  }, [navigate, sessionToken, setResult]);

  return <div id="battle-root" />;
}
```

`apps/web/src/game/scenes/BattleScene.ts`

```ts
import Phaser from "phaser";
import { applyAction, initialBattleState } from "../logic/battleEngine";

type BattleResult = {
  result: "victory" | "defeat" | "draw";
  hpRemaining: number;
  enemyHpRemaining: number;
  durationSeconds: number;
  score: number;
};

export class BattleScene extends Phaser.Scene {
  private battle = initialBattleState();
  private finished = false;

  constructor(private readonly callbacks: { onFinished: (result: BattleResult) => void }) {
    super("BattleScene");
  }

  create() {
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.finished) return;

        this.battle = applyAction(this.battle, { actor: "enemy", type: "attack" });
        this.battle.timeLeft -= 1;

        if (this.battle.enemy.hp <= 0 || this.battle.player.hp <= 0 || this.battle.timeLeft <= 0) {
          this.finishBattle();
        }
      }
    });

    this.input.on("pointerdown", () => {
      if (this.finished) return;
      this.battle = applyAction(this.battle, { actor: "player", type: "attack" });
      if (this.battle.enemy.hp <= 0) this.finishBattle();
    });
  }

  private finishBattle() {
    this.finished = true;
    const result =
      this.battle.enemy.hp === this.battle.player.hp
        ? "draw"
        : this.battle.enemy.hp < this.battle.player.hp
          ? "victory"
          : "defeat";

    this.callbacks.onFinished({
      result,
      hpRemaining: this.battle.player.hp,
      enemyHpRemaining: this.battle.enemy.hp,
      durationSeconds: 45 - this.battle.timeLeft,
      score: this.battle.player.hp * 10
    });
  }
}
```

- [ ] **Step 5: Write and run the failing result screen test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultPage } from "./ResultPage";

describe("ResultPage", () => {
  it("shows campaign follow-up copy", () => {
    render(<ResultPage result="victory" remainingPlays={1} />);

    expect(screen.getByText(/data kamu sudah tercatat/i)).toBeInTheDocument();
    expect(screen.getByText(/sisa kesempatan: 1/i)).toBeInTheDocument();
  });
});
```

Run:

```bash
npm test --workspace @mecha/web -- ResultPage.test.tsx
```

Expected: FAIL because the page does not exist yet.

- [ ] **Step 6: Implement the result page and route it**

`apps/web/src/pages/result/ResultPage.tsx`

```tsx
type Props = {
  result: "victory" | "defeat" | "draw";
  remainingPlays: number;
};

export function ResultPage({ result, remainingPlays }: Props) {
  const title =
    result === "victory" ? "Victory" : result === "defeat" ? "Defeat" : "Draw";

  return (
    <section>
      <h1>{title}</h1>
      <p>Data kamu sudah tercatat. Admin akan meninjau hasil permainan ini.</p>
      <p>Sisa kesempatan: {remainingPlays}</p>
    </section>
  );
}
```

Update `apps/web/src/state/campaignStore.ts`:

```ts
type BattleOutcome = "victory" | "defeat" | "draw";

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
  setResult: (result) => set({ result })
}));
```

Update `apps/web/src/App.tsx`:

```tsx
import { BattlePage } from "./pages/battle/BattlePage";
import { ResultPage } from "./pages/result/ResultPage";

function AppRoutes() {
  const navigate = useNavigate();
  const setPlayer = useCampaignStore((state) => state.setPlayer);
  const result = useCampaignStore((state) => state.result);
  const remainingPlays = useCampaignStore((state) => state.remainingPlays ?? 0);

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStart={() => navigate("/form")} />} />
      <Route
        path="/form"
        element={
          <PlayerFormPage
            onSubmit={(payload) => {
              setPlayer(payload);
              navigate("/validate");
            }}
          />
        }
      />
      <Route path="/validate" element={<ValidationPage />} />
      <Route path="/briefing" element={<BriefingPage />} />
      <Route path="/battle" element={<BattlePage />} />
      <Route
        path="/result"
        element={<ResultPage result={result ?? "draw"} remainingPlays={remainingPlays} />}
      />
    </Routes>
  );
}
```

- [ ] **Step 7: Run both frontend battle tests**

Run:

```bash
npm test --workspace @mecha/web -- battleEngine.test.ts ResultPage.test.tsx
```

Expected: PASS with `3 passed`.

- [ ] **Step 8: Commit battle flow**

```bash
git add apps/web apps/server
git commit -m "feat: add mecha battle loop and result logging"
```

## Task 6: Add Admin Session View And Demo Polish

**Files:**
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/modules/admin/admin.route.ts`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/pages/admin/AdminPage.tsx`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/public/assets/readme.md`
- Test: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/tests/admin-session.test.ts`
- Modify: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/server/src/app.ts`
- Modify: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/App.tsx`
- Modify: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/apps/web/src/styles/theme.css`

- [ ] **Step 1: Write the failing admin list test**

```ts
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { resetDatabase, seedCompletedSession } from "../src/lib/db";

describe("GET /api/admin/sessions", () => {
  beforeEach(() => {
    resetDatabase(":memory:");
    seedCompletedSession();
  });

  it("returns completed game sessions for admin review", async () => {
    const response = await request(createApp()).get("/api/admin/sessions");

    expect(response.status).toBe(200);
    expect(response.body.sessions[0]).toMatchObject({
      orderNumber: "SPX-002",
      result: "victory",
      score: 850
    });
  });
});
```

- [ ] **Step 2: Run the admin test to verify it fails**

Run:

```bash
npm test --workspace @mecha/server -- admin-session.test.ts
```

Expected: FAIL because the admin session route and seed helper do not exist.

- [ ] **Step 3: Implement admin session listing**

`apps/server/src/modules/admin/admin.route.ts`

```ts
import { Router } from "express";
import { getDatabase } from "../../lib/db";

export const adminRouter = Router();

adminRouter.get("/sessions", (_request, response) => {
  const sessions = getDatabase()
    .prepare(`
      select
        game_sessions.session_token as sessionToken,
        orders.order_number as orderNumber,
        battle_results.result as result,
        battle_results.score as score
      from game_sessions
      join orders on orders.id = game_sessions.order_id
      join battle_results on battle_results.session_id = game_sessions.id
      order by game_sessions.id desc
    `)
    .all();

  response.json({ sessions });
});
```

Add to `apps/server/src/app.ts`:

```ts
import { adminRouter } from "./modules/admin/admin.route";

app.use("/api/admin", adminRouter);
```

Add to `apps/server/src/lib/db.ts`:

```ts
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
```

- [ ] **Step 4: Build a minimal admin page and asset placeholders**

`apps/web/src/pages/admin/AdminPage.tsx`

```tsx
import { useEffect, useState } from "react";

type AdminSession = {
  sessionToken: string;
  orderNumber: string;
  result: string;
  score: number;
};

export function AdminPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/admin/sessions")
      .then((response) => response.json())
      .then((data) => setSessions(data.sessions));
  }, []);

  return (
    <section>
      <h1>Admin Dashboard</h1>
      <ul>
        {sessions.map((session) => (
          <li key={session.sessionToken}>
            {session.orderNumber} - {session.result} - {session.score}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`apps/web/public/assets/readme.md`

```md
# Demo Asset Slots

- `landing-bg.webp` — promo landing background
- `mecha-player.webp` — player mecha illustration
- `mecha-enemy.webp` — enemy mecha illustration
- `arena-bg.webp` — battle arena background
- `hit.wav` — attack sound
- `skill.wav` — special skill sound
```

Update `theme.css` with a dark sci-fi palette:

```css
:root {
  --bg: #07111f;
  --panel: rgba(10, 22, 39, 0.86);
  --line: #40d9ff;
  --accent: #7a5cff;
  --text: #eff7ff;
}
```

Update `apps/web/src/App.tsx`:

```tsx
import { AdminPage } from "./pages/admin/AdminPage";

<Route path="/admin" element={<AdminPage />} />
```

- [ ] **Step 5: Run the admin test and smoke-check the app**

Run:

```bash
npm test --workspace @mecha/server -- admin-session.test.ts
npm run build
```

Expected:

- first command PASS with `1 passed`
- second command completes web and server builds without TypeScript errors

- [ ] **Step 6: Commit admin tools and polish**

```bash
git add apps/web apps/server
git commit -m "feat: add admin review screen and demo polish"
```

## Task 7: Final Verification And Demo Script

**Files:**
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/README.md`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/demo/orders-shopee.csv`
- Create: `c:/Users/LENOVO/OneDrive/Desktop/inusafluencer/demo/orders-tiktok.csv`

- [ ] **Step 1: Write the demo seed files**

`demo/orders-shopee.csv`

```csv
order_number,quantity
SPX-001,1
SPX-002,2
SPX-003,3
```

`demo/orders-tiktok.csv`

```csv
order_number,quantity
TTK-001,1
TTK-002,2
TTK-003,3
```

- [ ] **Step 2: Document the local demo flow**

`README.md`

````md
# Mecha Promo Game

## Run locally

```bash
npm install
npm run dev:server
npm run dev:web
```

## Demo flow

1. Open the web app.
2. Import `demo/orders-shopee.csv` from the admin upload endpoint.
3. Start a mission with order `SPX-002`.
4. Verify that the first and second runs are accepted.
5. Verify that the third run returns `Kuota bermain untuk order ini sudah habis.`
6. Finish one battle and confirm the result appears in the admin session list.
````

- [ ] **Step 3: Run the full test suite**

Run:

```bash
npm test
```

Expected: all backend and frontend test files pass.

- [ ] **Step 4: Do a manual smoke walkthrough**

Run:

```bash
npm run dev:server
npm run dev:web
```

Manual checklist:

- import a Shopee CSV file
- open `/`
- submit the form with `SPX-002`
- reach `/battle`
- finish the battle and land on `/result`
- confirm `/admin` shows the recorded session

- [ ] **Step 5: Commit documentation and demo fixtures**

```bash
git add README.md demo
git commit -m "docs: add local demo walkthrough"
```

## Self-Review

### Spec Coverage

- Promo QR funnel: covered by Task 4 landing, form, validation, and briefing flow.
- Order import from admin export: covered by Task 2 import route and repository.
- Quota based on quantity: covered by Task 2 schema plus Task 3 session start logic.
- One battle arena with basic actions: covered by Task 5 battle engine and Phaser scene.
- Result logging and admin review: covered by Task 5 result route and Task 6 admin list.
- Runnable demo and sample data: covered by Task 7.

### Placeholder Scan

- No `TODO`, `TBD`, or “implement later” placeholders remain in the plan.
- Every code step names exact file paths and concrete commands.

### Type Consistency

- Platform values stay `shopee | tiktok` across server and web.
- Order keys stay `orderNumber`, `quantity`, `playQuota`, `usedPlays` across tests and API.
- Battle result keys stay `result`, `hpRemaining`, `enemyHpRemaining`, `durationSeconds`, `score`.
