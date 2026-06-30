import cors from "cors";
import express from "express";
import { adminRouter } from "./modules/admin/admin.route";
import { gameRouter } from "./modules/game/game.route";
import { healthRouter } from "./modules/health/health.route";
import { importRouter } from "./modules/imports/import.route";
import { listOrders } from "./modules/orders/order.repository";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/health", healthRouter);
  app.use("/api/game", gameRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/admin/imports", importRouter);
  app.get("/api/admin/orders", (request, response) => {
    response.json({ orders: listOrders(request.query.platform as string | undefined) });
  });

  return app;
}
