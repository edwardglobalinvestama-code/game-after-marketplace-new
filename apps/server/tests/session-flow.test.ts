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
      usedPlays: 0,
    });
  });

  it("creates a game session and consumes one remaining play", async () => {
    const response = await request(createApp()).post("/api/game/start").send({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      platform: "shopee",
      orderNumber: "SPX-002",
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      sessionToken: expect.any(String),
      remainingPlays: 1,
    });
  });

  it("rejects an order whose quota is already used", async () => {
    resetDatabase(":memory:");
    seedOrder({
      platform: "shopee",
      orderNumber: "SPX-999",
      quantity: 1,
      playQuota: 1,
      usedPlays: 1,
    });

    const response = await request(createApp()).post("/api/game/start").send({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      platform: "shopee",
      orderNumber: "SPX-999",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Kuota bermain untuk order ini sudah habis.");
  });

  it("rejects a second active session for the same order", async () => {
    await request(createApp()).post("/api/game/start").send({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      platform: "shopee",
      orderNumber: "SPX-002",
    });

    const second = await request(createApp()).post("/api/game/start").send({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      platform: "shopee",
      orderNumber: "SPX-002",
    });

    expect(second.status).toBe(409);
    expect(second.body.message).toBe("Order ini sedang dipakai pada sesi game aktif.");
  });
});
