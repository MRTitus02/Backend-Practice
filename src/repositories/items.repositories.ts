import { db } from "../db/client";
import { items } from "../db/schema";
import { eq, sql, and, asc, desc } from "drizzle-orm";

export const itemsRepository = {
  getAll: async (limit: number = 10, offset: number = 0, userId?: number, sort: string = "ASC") => {
    let dbQuery = db.select().from(items);

    if (userId) {
      dbQuery = dbQuery.where(eq(items.userId, userId));
    }

    const orderBy = sort === "DESC" ? desc(items.id) : asc(items.id);
    const results = await dbQuery.orderBy(orderBy).limit(limit).offset(offset);
    return results;
  },

  getById: async (id: number) => {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  },

  search: async (query: string, limit: number = 10, offset: number = 0, userId?: number) => {
    const similarityThreshold = 0.1;

    // Ensure pg_trgm extension is available
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    if (userId) {
      return db.execute(
        sql`
          SELECT 
            id, 
            title, 
            description, 
            user_id as "userId", 
            similarity(title || ' ' || description, ${query}) as similarity
          FROM items
          WHERE similarity(title || ' ' || description, ${query}) > ${similarityThreshold}
            AND user_id = ${userId}
          ORDER BY similarity DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      );
    }

    return db.execute(
      sql`
        SELECT 
          id, 
          title, 
          description, 
          user_id as "userId", 
          similarity(title || ' ' || description, ${query}) as similarity
        FROM items
        WHERE similarity(title || ' ' || description, ${query}) > ${similarityThreshold}
        ORDER BY similarity DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    );
  },

  create: ({ title, description, userId }: any) =>
    db.insert(items).values({ title, description, userId }).returning(),

  update: (id: number, data: any) =>
    db.update(items)
      .set(data)
      .where(eq(items.id, id))
      .returning(),

  delete: (id: number) =>
    db.delete(items)
      .where(eq(items.id, id)),
};
