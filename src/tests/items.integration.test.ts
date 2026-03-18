import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startServer } from "../index";
import { db } from "../db/client";
import { eq } from "drizzle-orm";
import { items, mailJobs, users } from "../db/schema";

let server: any;
let baseUrl = "http://localhost:3000";
let createdUserId: number | null = null;
let itemIds: number[] = [];

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
  // cleanup only the records created by this test suite
  for (const id of itemIds) {
    await db.delete(items).where(eq(items.id, id));
  }
  if (createdUserId) {
    await db.delete(users).where(eq(users.id, createdUserId));
  }
  server.close();
});

describe("Items CRUD (integration)", () => {
  let token: string;
  let userId: number;
  let itemIds: number[] = [];

  it("creates a user and logs in", async () => {
    const email = `test+${Date.now()}@example.com`;
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

  it("creates multiple items for search testing", async () => {
    const itemsData = [
      { title: "Laptop Computer", description: "A powerful laptop for work" },
      { title: "Wireless Mouse", description: "Ergonomic wireless mouse" },
      { title: "Coffee Mug", description: "Ceramic coffee mug" },
      { title: "Notebook", description: "Spiral notebook for notes" },
      { title: "Headphones", description: "Noise cancelling headphones" },
    ];

    for (const item of itemsData) {
      const res = await request(baseUrl)
        .post("/items")
        .set("Authorization", `Bearer ${token}`)
        .send(item)
        .expect(201);
      itemIds.push(res.body.id);
    }
  });

  it("lists items", async () => {
    const res = await request(baseUrl)
      .get("/items")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5); // We created 5 items
  });

  it("searches items", async () => {
    const res = await request(baseUrl)
      .get("/items/search?q=laptop")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toContain("Laptop");
    expect(res.body.data[0]).toHaveProperty("similarity");
    expect(res.body.pagination).toBeDefined();
  });

  it("searches items with pagination", async () => {
    const res = await request(baseUrl)
      .get("/items/search?q=computer&limit=1&offset=0")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.limit).toBe(1);
    expect(res.body.pagination.offset).toBe(0);
  });

  it("searches items with no results", async () => {
    const res = await request(baseUrl)
      .get("/items/search?q=nonexistentitem")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it("requires query parameter", async () => {
    await request(baseUrl)
      .get("/items/search")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });

  it("updates an item", async () => {
    const res = await request(baseUrl)
      .put(`/items/${itemIds[0]}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" })
      .expect(200);

    expect(res.body.title).toBe("Updated Title");
  });

  it("deletes an item", async () => {
    await request(baseUrl)
      .delete(`/items/${itemIds[0]}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const list = await request(baseUrl)
      .get("/items")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(list.body.some((item: any) => item.id === itemIds[0])).toBe(false);
  });
});
