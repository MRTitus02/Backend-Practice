import { usersService } from "../services/users.service.js";

export const usersController = {
  async getAll(c: any) {
    const users = await usersService.getAll();
    return c.json(users);
  },

  async getById(c: any) {
    const id = Number(c.req.param("id"));
    const user = await usersService.getById(id);
    if (!user) return c.json({ message: "User not found" }, 404);
    return c.json(user);
  },

  async create(c: any) {
    const body = await c.req.json();
    const user = await usersService.create(body);
    return c.json(user, 201);
  },

  async update(c: any) {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const user = await usersService.update(id, body);
    if (!user) return c.json({ message: "User not found" }, 404);
    return c.json(user);
  },

  async delete(c: any) {
    const id = Number(c.req.param("id"));
    await usersService.delete(id);
    return c.json({ message: "User deleted" });
  },
};
