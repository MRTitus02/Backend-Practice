import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startServer } from "../index";
import { db } from "../db/client";
import { files, users } from "../db/schema";
import { eq } from "drizzle-orm";

let server: any;
let baseUrl = "http://localhost:3000";
let createdUserIds: number[] = [];
let createdFileIds: string[] = [];

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
  for (const fileId of createdFileIds) {
    await db.delete(files).where(eq(files.id, fileId));
  }

  for (const userId of createdUserIds) {
    await db.delete(users).where(eq(users.id, userId));
  }

  server.close();
});

describe("File upload/download flow (integration)", () => {
  let userToken: string;
  let userId: number;

  it("registers and logs in a user", async () => {
    const email = `filetest+${Date.now()}@example.com`;
    const password = "TestPass123";

    const res = await request(baseUrl)
      .post("/auth/register")
      .send({ name: "File User", email, password })
      .expect(201);

    userId = res.body.user?.id;
    expect(typeof userId).toBe("number");
    createdUserIds.push(userId);

    const loginRes = await request(baseUrl)
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    userToken = loginRes.body.tokens.accessToken;
    expect(typeof userToken).toBe("string");
  });

  it("generates an upload URL", async () => {
    const res = await request(baseUrl)
      .post("/files/upload-url")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ mimeType: "image/png" })
      .expect(201);

    expect(res.body).toHaveProperty("url");
    expect(res.body).toHaveProperty("fileId");

    createdFileIds.push(res.body.fileId);
  });

  it("generates a download URL for the same role", async () => {
    const uploadRes = await request(baseUrl)
      .post("/files/upload-url")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ mimeType: "image/jpeg" })
      .expect(201);

    const fileId = uploadRes.body.fileId;
    createdFileIds.push(fileId);

    const downloadRes = await request(baseUrl)
      .get(`/files/${fileId}/download`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(downloadRes.body).toHaveProperty("url");
  });

  it("returns 403 when role does not match and user is not admin", async () => {
    const uploadRes = await request(baseUrl)
      .post("/files/upload-url")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ mimeType: "application/pdf" })
      .expect(201);

    const fileId = uploadRes.body.fileId;
    createdFileIds.push(fileId);

    // elevate the file access to admin-only by direct DB patch
    await db.update(files).set({ roleAccess: "admin" }).where(eq(files.id, fileId));

    await request(baseUrl)
      .get(`/files/${fileId}/download`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);
  });

  it("returns 404 on invalid file ID", async () => {
    await request(baseUrl)
      .get("/files/nonexistent-file-id/download")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(404);
  });

  it("rejects upload URL payload without mimeType", async () => {
    await request(baseUrl)
      .post("/files/upload-url")
      .set("Authorization", `Bearer ${userToken}`)
      .send({})
      .expect(400);
  });
});
