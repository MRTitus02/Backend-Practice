import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startServer } from "../index";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

let server: any;
let baseUrl = "http://localhost:3000";
const createdUserIds: number[] = [];

beforeAll(async () => {
  server = startServer(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));

  const address = server.address();
  const port = typeof address === "object" ? address.port : 3000;
  baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
  // Clean only users created in this suite
  for (const id of createdUserIds) {
    await db.delete(users).where(eq(users.id, id));
  }
  server.close();
});

describe("Auth / RBAC behaviour (integration)", () => {
  it("returns 400 when register payload is invalid", async () => {
    const res = await request(baseUrl)
      .post("/auth/register")
      .send({ name: "Test" }) // missing email/password
      .expect(400);

    expect(res.body).toHaveProperty("errors");
  });

  it("returns 401 when accessing a protected route without a token", async () => {
    await request(baseUrl).get("/users").expect(401);
  });

  it("returns 401 when using an invalid token", async () => {
    await request(baseUrl)
      .get("/users")
      .set("Authorization", "Bearer invalid.token.value")
      .expect(401);
  });

  it("returns 403 for a non-admin user on admin-only endpoints", async () => {
    // Create an admin user (so we can create a normal user)
    const adminRes = await request(baseUrl)
      .post("/auth/register")
      .send({
        name: "Admin",
        email: `admin+${Date.now()}@example.com`,
        password: "Password123",
        role: "admin",
      })
      .expect(201);
    createdUserIds.push(adminRes.body.user.id);

    // Create a regular user
    const userRes = await request(baseUrl)
      .post("/auth/register")
      .send({
        name: "Normal",
        email: `normal+${Date.now()}@example.com`,
        password: "Password123",
      })
      .expect(201);
    createdUserIds.push(userRes.body.user.id);

    // Login as normal user
    const loginRes = await request(baseUrl)
      .post("/auth/login")
      .send({
        email: userRes.body.user.email,
        password: "Password123",
      })
      .expect(200);

    const token = loginRes.body.tokens.accessToken;
    expect(typeof token).toBe("string");

    // Normal user tries to access an admin-only endpoint
    await request(baseUrl)
      .get("/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });
});