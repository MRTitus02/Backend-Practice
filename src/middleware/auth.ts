import { verifyAccessToken } from "../utils/jwt";
import { usersRepository } from "../repositories/users.repository";

export const authMiddleware = {
  authenticate: async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ message: "Missing or invalid Authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = verifyAccessToken(token);
      const userId = Number(payload.sub);
      const user = await usersRepository.getById(userId);
      if (!user) {
        return c.json({ message: "User not found" }, 401);
      }

      c.set("user", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      return next();
    } catch (error) {
      return c.json({ message: "Invalid or expired token" }, 401);
    }
  },

  authorize: (...allowedRoles: string[]) => {
    return (c: any, next: any) => {
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      return next();
    };
  },
};