import { itemsService } from "../services/items.service";
import { createItemDto, updateItemDto } from "../dtos/items.dto";

export const itemsController = {

  async getAll(c: any) {
    const items = await itemsService.getAll();
    return c.json(items);
  },

  async create(c: any) {
    const body = await c.req.json();

    const parsed = createItemDto.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: parsed.error.format() }, 400);
    }

    const item = await itemsService.create(parsed.data);

    return c.json(item, 201);
  },

  async update(c: any) {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const parsed = updateItemDto.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: parsed.error.format() }, 400);
    }

    const updated = await itemsService.update(id, parsed.data);

    if (!updated) {
      return c.json({ message: "Item not found" }, 404);
    }

    return c.json(updated);
  },

  async delete(c: any) {
    const id = Number(c.req.param("id"));

    await itemsService.delete(id);

    return c.json({ message: "Item deleted" }, 200);
  }

};