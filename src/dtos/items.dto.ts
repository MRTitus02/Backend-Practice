import { z } from "@hono/zod-openapi";

export const createItemDto = z
  .object({
    title: z.string().min(1).openapi({ example: "New Item" }),
    description: z.string().min(1).openapi({ example: "A description for the new item." }),
  })
  .openapi("CreateItemRequest");

export const updateItemDto = z
  .object({
    title: z.string().optional().openapi({ example: "Updated Item" }),
    description: z.string().optional().openapi({ example: "An updated description." }),
  })
  .openapi("UpdateItemRequest");

export type CreateItemDto = z.infer<typeof createItemDto>;
export type UpdateItemDto = z.infer<typeof updateItemDto>;
