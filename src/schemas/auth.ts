import { z } from "@hono/zod-openapi";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required"),
    email: z
      .string()
      .email("Must be a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must be at most 128 characters long"),
    role: z
      .enum(["user", "admin"])
      .optional()
      .default("user"),
  })
  .openapi("RegisterPayload");

export const loginSchema = z
  .object({
    email: z
      .string()
      .email("Must be a valid email"),
    password: z
      .string()
      .min(1, "Password is required"),
  })
  .openapi("LoginPayload");

export const refreshTokenSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, "Refresh token is required"),
  })
  .openapi("RefreshTokenPayload");

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;
