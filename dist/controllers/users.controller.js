"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const users_service_js_1 = require("../services/users.service.js");
exports.usersController = {
    async getAll(c) {
        const users = await users_service_js_1.usersService.getAll();
        return c.json(users);
    },
    async getById(c) {
        const id = Number(c.req.param("id"));
        const user = await users_service_js_1.usersService.getById(id);
        if (!user)
            return c.json({ message: "User not found" }, 404);
        return c.json(user);
    },
    async create(c) {
        const body = await c.req.json();
        const user = await users_service_js_1.usersService.create(body);
        return c.json(user, 201);
    },
    async update(c) {
        const id = Number(c.req.param("id"));
        const body = await c.req.json();
        const user = await users_service_js_1.usersService.update(id, body);
        if (!user)
            return c.json({ message: "User not found" }, 404);
        return c.json(user);
    },
    async delete(c) {
        const id = Number(c.req.param("id"));
        await users_service_js_1.usersService.delete(id);
        return c.json({ message: "User deleted" });
    },
};
//# sourceMappingURL=users.controller.js.map