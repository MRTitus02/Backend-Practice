import { Hono } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { createAutoRoute } from "../utils/scalargen.js";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/users.dto.js";
import { createItemDto, updateItemDto } from "../dtos/items.dto.js";
import { loginSchema, refreshTokenSchema, registerSchema } from "../schemas/auth.js";
import { z } from "@hono/zod-openapi";

// This file sets up a Hono app that generates an OpenAPI document based on the defined routes and schemas. It uses the OpenAPIHono class to define the API metadata
// and the Scalar UI to serve the documentation. The actual route handlers are no-ops
// because this app is only used for generating OpenAPI metadata, not for handling real requests.


const openapi = new OpenAPIHono();

const OPENAPI_DOCUMENT_CONFIG = {
  openapi: "3.0.0",
  info: {
    title: "My App API",
    version: "1.0.0",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const UserSchema = z
  .object({
    id: z.number().describe("User ID"),
    name: z.string().describe("User full name"),
    email: z.string().email().describe("User email"),
  })
  .openapi("User");

const ItemSchema = z
  .object({
    id: z.number().describe("Item ID"),
    title: z.string().describe("Item title"),
    description: z.string().describe("Item description"),
    userId: z.number().describe("ID of the user who owns the item"),
  })
  .openapi("Item");

const PaginationSchema = z.object({
  limit: z.number().describe("Number of results per page"),
  offset: z.number().describe("Number of results to skip"),
  hasMore: z.boolean().describe("Whether there are more results available"),
});

const PaginatedUsersResponseSchema = z
  .object({
    data: z.array(UserSchema).describe("Array of users"),
    pagination: PaginationSchema,
  })
  .openapi("PaginatedUsersResponse");

const PaginatedItemsResponseSchema = z
  .object({
    data: z.array(ItemSchema).describe("Array of items"),
    pagination: PaginationSchema,
  })
  .openapi("PaginatedItemsResponse");

const UsersSchema = z.array(UserSchema).describe("Array of users").openapi("Users");
const ItemsSchema = z.array(ItemSchema).describe("Array of items").openapi("Items");

const MessageSchema = z
  .object({
    message: z.string(),
  })
  .openapi("Message");

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("Error");

const TokenSchema = z
  .object({
    accessToken: z.string().describe("JWT access token"),
    refreshToken: z.string().describe("JWT refresh token"),
  })
  .openapi("Token");

const AuthResponseSchema = z
  .object({
    user: UserSchema,
    tokens: TokenSchema,
  })
  .openapi("AuthResponse");

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

// Auth
openapi.openapi(
  createAutoRoute({
    method: "post",
    path: "/auth/register",
    tag: "Auth",
    summary: "Register a new user",
    requestSchema: registerSchema,
    security: [],
    responses: {
      201: { description: "Created", content: { "application/json": { schema: AuthResponseSchema } } },
    },
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "post",
    path: "/auth/login",
    tag: "Auth",
    summary: "Log in and receive access and refresh tokens",
    requestSchema: loginSchema,
    security: [],
    responses: {
      200: { description: "Authenticated", content: { "application/json": { schema: AuthResponseSchema } } },
    },
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "post",
    path: "/auth/refresh",
    tag: "Auth",
    summary: "Refresh access token using a refresh token",
    requestSchema: refreshTokenSchema,
    security: [],
    responses: {
      200: { description: "Authenticated", content: { "application/json": { schema: AuthResponseSchema } } },
    },
  }),
  noopHandler
);

// Users
openapi.openapi(
  createAutoRoute({
    method: "get",
    path: "/users",
    tag: "Users",
    summary: "Get all users with optional search, pagination, and sorting",
    querySchema: z.object({
      q: z.string().optional().describe("Search query string (searches name and email)"),
      limit: z.string().optional().describe("Maximum number of results (default: 10)"),
      offset: z.string().optional().describe("Number of results to skip (default: 0)"),
      sort: z.enum(["ASC", "DESC"]).optional().describe("Sort order by ID (default: ASC)"),
    }),
    responseSchema: PaginatedUsersResponseSchema,
    security: [{ bearerAuth: [] }],
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
    security: [{ bearerAuth: [] }],
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
    security: [{ bearerAuth: [] }],
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
    security: [{ bearerAuth: [] }],
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
    security: [{ bearerAuth: [] }],
  }),
  noopHandler
);

// Items
openapi.openapi(
  createAutoRoute({
    method: "get",
    path: "/items",
    tag: "Items",
    summary: "Get all items with optional search, pagination, and sorting",
    querySchema: z.object({
      q: z.string().optional().describe("Search query string (searches title and description)"),
      limit: z.string().optional().describe("Maximum number of results (default: 10)"),
      offset: z.string().optional().describe("Number of results to skip (default: 0)"),
      userId: z.string().optional().describe("Filter by user ID (admin only)"),
      sort: z.enum(["ASC", "DESC"]).optional().describe("Sort order by ID (default: ASC)"),
    }),
    responseSchema: PaginatedItemsResponseSchema,
    security: [{ bearerAuth: [] }],
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
    security: [{ bearerAuth: [] }],
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
    security: [{ bearerAuth: [] }],
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
    security: [{ bearerAuth: [] }],
  }),
  noopHandler
);

// Mail
const MailJobSchema = z
  .object({
    id: z.number().describe("Mail job ID"),
    toEmail: z.string().email().describe("Recipient email"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body"),
    status: z.string().describe("Job status"),
  })
  .openapi("MailJob");

const SendMailSchema = z
  .object({
    to: z.string().email().describe("Recipient email"),
    subject: z.string().min(1).describe("Email subject"),
    body: z.string().min(1).describe("Email body"),
  })
  .openapi("SendMailPayload");

openapi.openapi(
  createAutoRoute({
    method: "post",
    path: "/mail/send",
    tag: "Mail",
    summary: "Queue an email to be sent",
    requestSchema: SendMailSchema,
    security: [{ bearerAuth: [] }],
    responses: {
      201: { description: "Mail queued", content: { "application/json": { schema: MailJobSchema } } },
    },
  }),
  noopHandler
);

// File schemas
const UploadUrlSchema = z
  .object({
    url: z.string().describe("Presigned upload URL"),
    fileId: z.string().describe("Unique file ID"),
  })
  .openapi("UploadUrl");

const DownloadUrlSchema = z
  .object({
    url: z.string().describe("Presigned download URL"),
  })
  .openapi("DownloadUrl");

// File routes
openapi.openapi(
  createAutoRoute({
    method: "post",
    path: "/files/upload-url",
    tag: "Files",
    summary: "Generate a presigned upload URL for file upload",
    requestSchema: z.object({
      mimeType: z.string().describe("MIME type of the file to upload"),
    }),
    security: [{ bearerAuth: [] }],
    responses: {
      201: {
        description: "Upload URL generated successfully",
        content: { "application/json": { schema: UploadUrlSchema } },
      },
      400: {
        description: "Bad request - missing mimeType",
        content: { "application/json": { schema: ErrorSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
  noopHandler
);

openapi.openapi(
  createAutoRoute({
    method: "get",
    path: "/files/{id}/download",
    tag: "Files",
    summary: "Generate a presigned download URL for file retrieval",
    paramSchema: z.object({
      id: z.string().describe("File ID"),
    }),
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Download URL generated successfully",
        content: { "application/json": { schema: DownloadUrlSchema } },
      },
      403: {
        description: "Forbidden - insufficient permissions",
        content: { "application/json": { schema: ErrorSchema } },
      },
      404: {
        description: "File not found",
        content: { "application/json": { schema: ErrorSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
  noopHandler
);

export const docsApp = new Hono();

docsApp.get("/openapi.json", (c) => {
  const document = openapi.getOpenAPIDocument(OPENAPI_DOCUMENT_CONFIG);
  document.components = document.components ?? {};
  document.components.securitySchemes = {
    ...(document.components.securitySchemes ?? {}),
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  };
  return c.json(document);
});

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
