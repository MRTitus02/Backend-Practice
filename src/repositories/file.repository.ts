import { db } from "../db/client";
import { files } from "../db/schema";
import { eq } from "drizzle-orm";

export const fileRepository = {
  create: (data: any) => db.insert(files).values(data).returning(),
  getById: async (id: string) => {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  },
  deleteById: (id: string) => db.delete(files).where(eq(files.id, id)),
};
