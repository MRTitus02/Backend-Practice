import { z } from "zod";

export const createItemDto = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  userId: z.number()
});

export const updateItemDto = z.object({
  title: z.string().optional(),
  description: z.string().optional()
});

export type CreateItemDto = z.infer<typeof createItemDto>;
export type UpdateItemDto = z.infer<typeof updateItemDto>;
