import { db } from "../db/client";
import { items } from "../db/schema";
import { eq } from "drizzle-orm";

export const itemsRepository = {
  getAll: () => db.select().from(items),

  create: ({ title, description, userId }: any) =>
    db.insert(items).values({ title, description, userId }).returning(),

  update: (id: number, data: any) =>
    db.update(items)
      .set(data)
      .where(eq(items.id, id))
      .returning(),

  delete: (id: number) =>
    db.delete(items)
      .where(eq(items.id, id))
};
