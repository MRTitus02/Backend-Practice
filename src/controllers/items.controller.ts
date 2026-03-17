import { itemsService } from "../services/items.service";
import { createItemDto, updateItemDto } from "../dtos/items.dto";

export const itemsController = {

  async getAll(c: any) {
    const items = await itemsService.getAll();
    return c.json(items);
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