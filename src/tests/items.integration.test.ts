import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startServer } from "../index";
import { db } from "../db/client";
import { items, users } from "../db/schema";

let server: any;
let baseUrl = "http://localhost:3000";

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
  // cleanup so tests can be re-run without conflicts
  await db.delete(items);
  await db.delete(users);
  server.close();
});

describe("Items CRUD (integration)", () => {
  let token: string;
  let itemId: number;

  it("creates a user and logs in", async () => {
    const email = `test+${Date.now()}@example.com`;
    const password = "TestPass123";

    await request(baseUrl)
      .post("/auth/register")
      .send({ name: "Test User", email, password })
      .expect(201);

    const login = await request(baseUrl)
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    token = login.body.tokens.accessToken;
    expect(typeof token).toBe("string");
  });

  it("creates an item", async () => {
    const res = await request(baseUrl)
      .post("/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Integration Item", description: "Created in test" })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe("Integration Item");
    itemId = res.body.id;
  });

  it("lists items", async () => {
    const res = await request(baseUrl)
      .get("/items")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((item: any) => item.id === itemId)).toBe(true);
  });

  it("updates an item", async () => {
    const res = await request(baseUrl)
      .put(`/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" })
      .expect(200);

    expect(res.body.title).toBe("Updated Title");
  });

  it("deletes an item", async () => {
    await request(baseUrl)
      .delete(`/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const list = await request(baseUrl)
      .get("/items")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(list.body.some((item: any) => item.id === itemId)).toBe(false);
  });
});
