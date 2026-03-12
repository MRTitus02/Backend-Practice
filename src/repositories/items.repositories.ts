import { db } from "../db/client.ts";
import { items } from "../db/schema.ts";

export const itemsRepository = {
  getAll: () => db.select().from(items),
  create: ({ title, description, userId }: any) =>
    db.insert(items).values({ title, description, userId }).returning(),
  update: (id: number, data: any) =>
    db.update(items).set(data).where(items.id.eq(id)).returning(),
  delete: (id: number) => db.delete(items).where(items.id.eq(id)),
};
