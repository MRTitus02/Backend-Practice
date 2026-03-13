import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const usersRepository = {
  getAll: () => db.select().from(users),

  getById: (id: number) =>
    db.select().from(users).where(eq(users.id, id)),

  create: ({ name, email }: any) =>
    db.insert(users).values({ name, email }).returning(),

  update: (id: number, data: any) =>
    db.update(users).set(data).where(eq(users.id, id)).returning(),

  delete: (id: number) =>
    db.delete(users).where(eq(users.id, id)),
};