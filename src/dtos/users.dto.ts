// dtos/users.dto.ts
import { z } from "zod";

export const CreateUserDTO = z.object({
  name: z.string().min(1).describe("User full name"),
  email: z.string().email().describe("User email"),
});

export const UpdateUserDTO = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});


export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;