// This file defines the database schema using Drizzle ORM for a PostgreSQL database
// It includes two tables: users and items, with a one-to-many relationship

import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
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

// Mail jobs table (for background email sending)
export const mailJobs = pgTable("mail_jobs", {
  id: serial("id").primaryKey(),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
