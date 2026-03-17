import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required in environment variables");
}

export type JwtPayload = {
  sub: string; // user id
  role: string;
};

export const signAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const signRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
