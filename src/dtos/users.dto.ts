// dtos/users.dto.ts
import { z } from "@hono/zod-openapi";

export const CreateUserDTO = z
  .object({
    name: z.string().min(1).openapi({ example: "Jane Doe" }),
    email: z.string().email().openapi({ example: "jane.doe@example.com" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .openapi({ example: "StrongP@ssw0rd" }),
  })
  .openapi("CreateUserRequest");

export const UpdateUserDTO = z
  .object({
    name: z.string().optional().openapi({ example: "Jane Doe" }),
    email: z.string().email().optional().openapi({ example: "jane.doe@example.com" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional()
      .openapi({ example: "StrongP@ssw0rd" }),
  })
  .openapi("UpdateUserRequest");


export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;