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
    response.status(400).json({ message: "platform and file are required" });
    return;
  }

  const orders = parseImportedOrders(platform, file.buffer, file.originalname);
  upsertOrders(orders);

  response.json({
    summary: {
      platform,
      importedOrders: orders.length,
    },
  });
});
