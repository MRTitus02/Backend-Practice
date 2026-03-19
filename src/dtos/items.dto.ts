import { z } from "@hono/zod-openapi";

export const createItemDto = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
  })
  .openapi("CreateItemRequest");

export const updateItemDto = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .openapi("UpdateItemRequest");

export type CreateItemDto = z.infer<typeof createItemDto>;
export type UpdateItemDto = z.infer<typeof updateItemDto>;
