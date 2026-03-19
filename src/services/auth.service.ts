import bcrypt from "bcryptjs";
import { JwtPayload, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { usersRepository } from "../repositories/users.repository";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const sanitizeUser = (user: any): AuthenticatedUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const authService = {
  async register({ name, email, password, role }: { name: string; email: string; password: string; role?: string }) {
    const normalizedEmail = email.toLowerCase();
    const existing = await usersRepository.getByEmail(normalizedEmail);
    if (existing) {
      throw new Error("A user with that email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role ?? "user";
    const [user] = await usersRepository.create({ name, email: normalizedEmail, passwordHash, role: userRole });

    const payload: JwtPayload = { sub: String(user.id), role: user.role ?? "user" };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await usersRepository.updateRefreshToken(user.id, refreshTokenHash);

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken },
    };
  },

  async login({ email, password }: { email: string; password: string }) {
    const normalizedEmail = email.toLowerCase();
    const user = await usersRepository.getByEmail(normalizedEmail);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const payload: JwtPayload = { sub: String(user.id), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await usersRepository.updateRefreshToken(user.id, refreshTokenHash);

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken },
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const userId = Number(payload.sub);
    const user = await usersRepository.getById(userId);

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const savedHash = user.refreshToken;
    if (!savedHash) {
      throw new Error("Refresh token not found");
    }

    const isValid = await bcrypt.compare(refreshToken, savedHash);
    if (!isValid) {
      throw new Error("Invalid refresh token");
    }

    const newPayload: JwtPayload = { sub: String(user.id), role: user.role };
    const accessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);
    const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

    await usersRepository.updateRefreshToken(user.id, refreshTokenHash);

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken: newRefreshToken },
    };
  },

  async verifyToken(token: string) {
    const payload = verifyRefreshToken(token);
    const userId = Number(payload.sub);
    const user = await usersRepository.getById(userId);
    if (!user) return null;
    return sanitizeUser(user);
  },
};
