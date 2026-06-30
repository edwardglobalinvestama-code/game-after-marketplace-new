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
      score: 850,
    });
  });
});
