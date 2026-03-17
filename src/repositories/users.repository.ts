import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const mapDbError = (error: any) => {
  if (typeof error?.message === "string" && error.message.includes("Failed query")) {
    throw new Error(
      "Database schema mismatch detected (missing columns/fields). Please run migrations and ensure the database schema matches the application model."
    );
  }
  throw error;
};

export const usersRepository = {
  getAll: () => db.select().from(users),

  getById: async (id: number) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      mapDbError(error);
    }
  },

  getByEmail: async (email: string) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      mapDbError(error);
    }
  },

  create: (data: any) => db.insert(users).values(data).returning(),

  updateRefreshToken: async (id: number, refreshToken: string) =>
    db.update(users)
      .set({ refreshToken })
      .where(eq(users.id, id))
      .returning(),

  update: (id: number, data: any) =>
    db.update(users).set(data).where(eq(users.id, id)).returning(),

  delete: (id: number) =>
    db.delete(users).where(eq(users.id, id)),
};