// This file defines the database schema using Drizzle ORM for a PostgreSQL database
// It includes two tables: users and items, with a one-to-many relationship

import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { email } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  refreshToken: text("refresh_token"),
});

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  userId: serial("user_id").references(() => users.id),
});
