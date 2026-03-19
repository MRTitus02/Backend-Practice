import { Hono } from "hono";
import { FileService } from "../services/file.service";

const fileRoutes = new Hono();

// Upload URL
fileRoutes.post("/upload-url", async (c) => {
  const user = (c as any).get("user");
  if (!user) return c.json({ message: "Unauthorized" }, 401);

  const body = await c.req.json();
  const mimeType = body.mimeType;

  if (!mimeType) {
    return c.json({ message: "mimeType is required" }, 400);
  }

  try {
    const result = await FileService.generateUploadUrl(user.id, user.role, mimeType);
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ message: error.message || "Failed to generate upload URL" }, 500);
  }
});

// Download URL
fileRoutes.get("/:id/download", async (c) => {
  const user = (c as any).get("user");
  if (!user) return c.json({ message: "Unauthorized" }, 401);

  const fileId = c.req.param("id");

  try {
    const result = await FileService.generateDownloadUrl(fileId, user.role);
    return c.json(result);
  } catch (error: any) {
    if (error?.status === 404) {
      return c.json({ message: "File not found" }, 404);
    }
    if (error?.status === 403) {
      return c.json({ message: "Forbidden" }, 403);
    }
    return c.json({ message: error.message || "Failed to generate download URL" }, 500);
  }
});

export default fileRoutes;