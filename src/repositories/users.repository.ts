import { db } from "../db/client";
import { users } from "../db/schema";
import { eq, sql, asc, desc } from "drizzle-orm";

const mapDbError = (error: any) => {
  if (typeof error?.message === "string" && error.message.includes("Failed query")) {
    throw new Error(
      "Database schema mismatch detected (missing columns/fields). Please run migrations and ensure the database schema matches the application model."
    );
  }
  throw error;
};

export const usersRepository = {
  getAll: async (query: string = "", limit: number = 10, offset: number = 0, sort: string = "ASC") => {
    let dbQuery = db.select().from(users);

    if (query.trim()) {
      dbQuery = dbQuery.where(
        sql`${users.email} ILIKE ${"%" + query + "%"} OR ${users.name} ILIKE ${"%" + query + "%"}`
      );
    }

    const orderBy = sort === "DESC" ? desc(users.id) : asc(users.id);
    const results = await dbQuery.orderBy(orderBy).limit(limit).offset(offset);
    return results;
  },

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
      const normalizedEmail = email.toLowerCase();
      const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
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