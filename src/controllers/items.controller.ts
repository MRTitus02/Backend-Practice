import { itemsService } from "../services/items.service";
import { createItemDto, updateItemDto } from "../dtos/items.dto";

export const itemsController = {

  async getAll(c: any) {
    const items = await itemsService.getAll();
    return c.json(items);
  },

  async search(c: any) {
    try {
      const q = c.req.query("q");
      const limit = Number(c.req.query("limit")) || 10;
      const offset = Number(c.req.query("offset")) || 0;
      const userId = c.req.query("userId") ? Number(c.req.query("userId")) : undefined;
      const currentUser = c.get("user");

      if (!q) {
        return c.json({ error: "Query parameter 'q' is required" }, 400);
      }

      // If not admin, only search own items
      const searchUserId = currentUser?.role === "admin" ? userId : currentUser?.id;

      const results = await itemsService.search(q, limit, offset, searchUserId);

      return c.json({
        data: results,
        pagination: {
          limit,
          offset,
          hasMore: results.length === limit,
        },
      });
    } catch (error) {
      console.error("Search error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },

  async create(c: any) {
    const body = await c.req.json();
    const currentUser = c.get("user");

    const parsed = createItemDto.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.format() }, 400);
    }

    const item = await itemsService.create({
      ...parsed.data,
      userId: currentUser?.id,
    });

    return c.json(item, 201);
  },

  async update(c: any) {
    const id = Number(c.req.param("id"));
    const currentUser = c.get("user");

    const existing = await itemsService.getById(id);
    if (!existing) {
      return c.json({ message: "Item not found" }, 404);
    }

    if (currentUser?.role !== "admin" && existing.userId !== currentUser?.id) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const parsed = updateItemDto.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: parsed.error.format() }, 400);
    }

    const updated = await itemsService.update(id, parsed.data);
    return c.json(updated);
  },

  async delete(c: any) {
    const id = Number(c.req.param("id"));
    const currentUser = c.get("user");

    const existing = await itemsService.getById(id);
    if (!existing) {
      return c.json({ message: "Item not found" }, 404);
    }

    if (currentUser?.role !== "admin" && existing.userId !== currentUser?.id) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await itemsService.delete(id);

    return c.json({ message: "Item deleted" }, 200);
  }

};