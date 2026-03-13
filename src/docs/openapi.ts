import { Hono } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { createAutoRoute } from "../utils/scalargen.js";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/users.dto.js";
import { createItemDto, updateItemDto } from "../dtos/items.dto.js";
import { z } from "zod";

const openapi = new OpenAPIHono();

const OPENAPI_DOCUMENT_CONFIG = {
  openapi: "3.0.0",
  info: {
    title: "My App API",
    version: "1.0.0",
  },
};

const UserSchema = z.object({
  id: z.number().describe("User ID"),
  name: z.string().describe("User full name"),
  email: z.string().email().describe("User email"),
});

const ItemSchema = z.object({
  id: z.number().describe("Item ID"),
  title: z.string().describe("Item title"),
  description: z.string().describe("Item description"),
  userId: z.number().describe("ID of the user who owns the item"),
});

const UsersSchema = z.array(UserSchema).describe("Array of users");
const ItemsSchema = z.array(ItemSchema).describe("Array of items");

const MessageSchema = z.object({
  message: z.string(),
});

// Register routes for OpenAPI generation. These handlers are no-ops because the
// actual implementation is in the main application; this app is only used to
// generate OpenAPI metadata.
const noopHandler = async (c: any) => c.text("", 204);

openapi.openapi(
  createAutoRoute({
    method: "get",
    path: "/health",
    tag: "Health",
    summary: "Check API health",
    responseSchema: z.object({ status: z.string().describe("Health status") }),
  }),
  noopHandler
);

// Users
openapi.openapi(
  createAutoRoute({
    method: "get",
    path: "/users",
    tag: "Users",
    summary: "Get all users",
    responseSchema: UsersSchema,
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "get",
    path: "/users/{id}",
    tag: "Users",
    summary: "Get a user by ID",
    paramSchema: z.object({ id: z.string().describe("User ID") }),
    responseSchema: UserSchema,
    responses: {
      404: { description: "User not found", content: { "application/json": { schema: MessageSchema } } },
    },
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "post",
    path: "/users",
    tag: "Users",
    summary: "Create a new user",
    requestSchema: CreateUserDTO,
    responses: {
      201: { description: "Created", content: { "application/json": { schema: UserSchema } } },
    },
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "put",
    path: "/users/{id}",
    tag: "Users",
    summary: "Update an existing user",
    paramSchema: z.object({ id: z.string().describe("User ID") }),
    requestSchema: UpdateUserDTO,
    responses: {
      404: { description: "User not found", content: { "application/json": { schema: MessageSchema } } },
    },
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "delete",
    path: "/users/{id}",
    tag: "Users",
    summary: "Delete a user",
    paramSchema: z.object({ id: z.string().describe("User ID") }),
    responseSchema: MessageSchema,
  }),
  noopHandler
);

// Items
openapi.openapi(
  createAutoRoute({
    method: "get",
    path: "/items",
    tag: "Items",
    summary: "Get all items",
    responseSchema: ItemsSchema,
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "post",
    path: "/items",
    tag: "Items",
    summary: "Create a new item",
    requestSchema: createItemDto,
    responses: {
      201: { description: "Created", content: { "application/json": { schema: ItemSchema } } },
    },
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "put",
    path: "/items/{id}",
    tag: "Items",
    summary: "Update an existing item",
    paramSchema: z.object({ id: z.string().describe("Item ID") }),
    requestSchema: updateItemDto,
    responses: {
      404: { description: "Item not found", content: { "application/json": { schema: MessageSchema } } },
    },
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "delete",
    path: "/items/{id}",
    tag: "Items",
    summary: "Delete an item",
    paramSchema: z.object({ id: z.string().describe("Item ID") }),
    responseSchema: MessageSchema,
  }),
  noopHandler
);

export const docsApp = new Hono();

docsApp.get("/openapi.json", (c) => c.json(openapi.getOpenAPIDocument(OPENAPI_DOCUMENT_CONFIG)));

const scalarUi = Scalar({
  pageTitle: "My App API Docs",
  sources: [
    {
      name: "My App API",
      url: "/docs/openapi.json",
    },
  ],
});

docsApp.get("/", scalarUi);
docsApp.get("/*", scalarUi);
