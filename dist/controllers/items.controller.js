"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsController = void 0;
const items_service_1 = require("../services/items.service");
const items_dto_1 = require("../dtos/items.dto");
exports.itemsController = {
    async getAll(c) {
        const items = await items_service_1.itemsService.getAll();
        return c.json(items);
    },
    async create(c) {
        const body = await c.req.json();
        const parsed = items_dto_1.createItemDto.safeParse(body);
        if (!parsed.success) {
            return c.json({ error: parsed.error.format() }, 400);
        }
        const item = await items_service_1.itemsService.create(parsed.data);
        return c.json(item, 201);
    },
    async update(c) {
        const id = Number(c.req.param("id"));
        const body = await c.req.json();
        const parsed = items_dto_1.updateItemDto.safeParse(body);
        if (!parsed.success) {
            return c.json({ error: parsed.error.format() }, 400);
        }
        const updated = await items_service_1.itemsService.update(id, parsed.data);
        if (!updated) {
            return c.json({ message: "Item not found" }, 404);
        }
        return c.json(updated);
    },
    async delete(c) {
        const id = Number(c.req.param("id"));
        await items_service_1.itemsService.delete(id);
        return c.json({ message: "Item deleted" }, 200);
    }
};
//# sourceMappingURL=items.controller.js.map