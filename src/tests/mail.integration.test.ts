import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { startServer } from "../index";
import { db } from "../db/client";
import { items, mailJobs, users } from "../db/schema";
import { mailService } from "../services/mail.service";
import { eq } from "drizzle-orm";

let server: any;
let baseUrl = "http://localhost:3000";
let createdUserId: number | null = null;
let createdMailJobId: number | null = null;

beforeAll(async () => {
  server = startServer(0);
  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });

  const address = server.address();
  const port = typeof address === "object" ? address.port : 3000;
  baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
  if (createdMailJobId) {
    await db.delete(mailJobs).where(eq(mailJobs.id, createdMailJobId));
  }
  if (createdUserId) {
    await db.delete(users).where(eq(users.id, createdUserId));
  }
  server.close();
});

describe("Mail queue & worker (integration)", () => {
  let token: string;
  let userId: number;
  const recipient = "recipient@example.com";

  it("creates a user and logs in", async () => {
    const email = `mail-test+${Date.now()}@example.com`;
    const password = "TestPass123";

    const registerRes = await request(baseUrl)
      .post("/auth/register")
      .send({ name: "Test User", email, password })
      .expect(201);

    userId = registerRes.body.user?.id;
    createdUserId = userId;

    const login = await request(baseUrl)
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    token = login.body.tokens.accessToken;
    expect(typeof token).toBe("string");
  });

  it("queues a mail job", async () => {
    const res = await request(baseUrl)
      .post("/mail/send")
      .set("Authorization", `Bearer ${token}`)
      .send({ to: "recipient@example.com", subject: "Test", body: "Hello" })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe("pending");

    createdMailJobId = res.body.id;
  });

  it("processes pending jobs via worker", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "" });
    vi.stubGlobal("fetch", fakeFetch as any);

    const processed = await mailService.processPendingJobs();
    expect(processed).toBeGreaterThan(0);

    const [job] = await db.select().from(mailJobs).where(eq(mailJobs.status, "sent"));
    expect(job).toBeDefined();
    expect(job.status).toBe("sent");

    vi.unstubAllGlobals();
  });
});
