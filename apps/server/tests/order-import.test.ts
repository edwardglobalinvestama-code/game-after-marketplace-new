import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { resetDatabase } from "../src/lib/db";

describe("POST /api/admin/imports/orders", () => {
  beforeEach(() => {
    resetDatabase(":memory:");
  });

  it("stores play quota from imported quantity", async () => {
    const csv = ["order_number,quantity", "SPX-001,3"].join("\n");

    const response = await request(createApp())
      .post("/api/admin/imports/orders")
      .field("platform", "shopee")
      .attach("file", Buffer.from(csv), "orders.csv");

    expect(response.status).toBe(200);
    expect(response.body.summary).toEqual({
      platform: "shopee",
      importedOrders: 1,
    });

    const check = await request(createApp())
      .get("/api/admin/orders")
      .query({ platform: "shopee" });

    expect(check.body.orders[0]).toMatchObject({
      orderNumber: "SPX-001",
      quantity: 3,
      playQuota: 3,
      usedPlays: 0,
    });
  });
});
