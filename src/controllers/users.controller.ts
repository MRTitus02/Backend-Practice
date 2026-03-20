import { usersService } from "../services/users.service.js";

export const usersController = {
  async getAll(c: any) {
    const currentUser = c.get("user");
    if (!currentUser || currentUser.role !== "admin") {
      return c.json({ message: "Forbidden" }, 403);
    }

    const q = c.req.query("q") || "";
    const limit = Number(c.req.query("limit")) || 10;
    const offset = Number(c.req.query("offset")) || 0;
    const sort = (c.req.query("sort") || "ASC").toUpperCase();

    if (sort !== "ASC" && sort !== "DESC") {
      return c.json({ message: "Invalid sort parameter. Must be ASC or DESC" }, 400);
    }

    const result = await usersService.getAll(q, limit, offset, sort);
    return c.json({
      data: result,
      pagination: {
        limit,
        offset,
        hasMore: result.length === limit,
      },
    });
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
