// dtos/users.dto.ts
import { z } from "@hono/zod-openapi";

export const CreateUserDTO = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    role: z
      .enum(["user", "admin"])
      .optional()
      .default("user"),
  })
  .openapi("CreateUserRequest");

export const UpdateUserDTO = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    role: z
      .enum(["user", "admin"])
      .optional(),
  })
  .openapi("UpdateUserRequest");


export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;