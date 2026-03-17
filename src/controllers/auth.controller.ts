import { authService } from "../services/auth.service";
import { loginSchema, refreshTokenSchema, registerSchema } from "../schemas/auth";

const formatZodErrors = (issues: any[]) =>
  issues.map((issue: any) => ({ path: issue.path.join("."), message: issue.message }));

export const authController = {
  async register(c: any) {
    const body = await c.req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return c.json({ errors: formatZodErrors(result.error.issues) }, 400);
    }

    try {
      const { user, tokens } = await authService.register(result.data);
      return c.json({ user, tokens }, 201);
    } catch (error: any) {
      return c.json({ message: error.message ?? "Registration failed" }, 400);
    }
  },

  async login(c: any) {
    const body = await c.req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return c.json({ errors: formatZodErrors(result.error.issues) }, 400);
    }

    try {
      const { user, tokens } = await authService.login(result.data);
      return c.json({ user, tokens });
    } catch (error: any) {
      return c.json({ message: error.message ?? "Login failed" }, 401);
    }
  },

  async refresh(c: any) {
    const body = await c.req.json();
    const result = refreshTokenSchema.safeParse(body);
    if (!result.success) {
      return c.json({ errors: formatZodErrors(result.error.issues) }, 400);
    }

    try {
      const { user, tokens } = await authService.refresh(result.data.refreshToken);
      return c.json({ user, tokens });
    } catch (error: any) {
      return c.json({ message: error.message ?? "Invalid refresh token" }, 401);
    }
  },
};
