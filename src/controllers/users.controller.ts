import { usersService } from "../services/users.service.js";

export const usersController = {
  async getAll(c: any) {
    const currentUser = c.get("user");
    if (!currentUser || currentUser.role !== "admin") {
      return c.json({ message: "Forbidden" }, 403);
    }

    const users = await usersService.getAll();
    return c.json(users);
  },

  async getById(c: any) {
    const currentUser = c.get("user");
    const id = Number(c.req.param("id"));

    if (!currentUser) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // Allow users to fetch their own profile or admins to fetch any user
    if (currentUser.role !== "admin" && currentUser.id !== id) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const user = await usersService.getById(id);
    if (!user) return c.json({ message: "User not found" }, 404);
    return c.json(user);
  },

  async create(c: any) {
    const currentUser = c.get("user");
    if (!currentUser || currentUser.role !== "admin") {
      return c.json({ message: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const user = await usersService.create(body);
    return c.json(user, 201);
  },

  async update(c: any) {
    const currentUser = c.get("user");
    const id = Number(c.req.param("id"));

    if (!currentUser) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // Only admins or the user themselves can update
    if (currentUser.role !== "admin" && currentUser.id !== id) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const user = await usersService.update(id, body);
    if (!user) return c.json({ message: "User not found" }, 404);
    return c.json(user);
  },

  async delete(c: any) {
    const currentUser = c.get("user");
    const id = Number(c.req.param("id"));

    if (!currentUser) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // Only admins or the user themselves can delete
    if (currentUser.role !== "admin" && currentUser.id !== id) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await usersService.delete(id);
    return c.json({ message: "User deleted" });
  },
};
