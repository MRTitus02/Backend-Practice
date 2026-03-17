import { db } from "../db/client";
import { mailJobs } from "../db/schema";
import { eq } from "drizzle-orm";

export const mailJobsRepository = {
  createJob: (data: {
    toEmail: string;
    subject: string;
    body: string;
  }) =>
    db
      .insert(mailJobs)
      .values(data)
      .returning(),

  getById: async (id: number) => {
    const [job] = await db.select().from(mailJobs).where(eq(mailJobs.id, id));
    return job;
  },

  getPending: () =>
    db
      .select()
      .from(mailJobs)
      .where(eq(mailJobs.status, "pending"))
      .orderBy(mailJobs.createdAt),

  updateStatus: (id: number, status: string, updates: { attempts?: number; lastError?: string } = {}) =>
    db
      .update(mailJobs)
      .set({
        status,
        updatedAt: new Date(),
        ...(updates.attempts !== undefined ? { attempts: updates.attempts } : {}),
        ...(updates.lastError !== undefined ? { lastError: updates.lastError } : {}),
      })
      .where(eq(mailJobs.id, id))
      .returning(),
};
