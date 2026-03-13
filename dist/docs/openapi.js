"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docsApp = void 0;
const hono_1 = require("hono");
const zod_openapi_1 = require("@hono/zod-openapi");
const hono_api_reference_1 = require("@scalar/hono-api-reference");
const scalargen_js_1 = require("../utils/scalargen.js");
const users_dto_js_1 = require("../dtos/users.dto.js");
const items_dto_js_1 = require("../dtos/items.dto.js");
const zod_1 = require("zod");
const openapi = new zod_openapi_1.OpenAPIHono();
const OPENAPI_DOCUMENT_CONFIG = {
    openapi: "3.0.0",
    info: {
        title: "My App API",
        version: "1.0.0",
    },
};
const UserSchema = zod_1.z.object({
    id: zod_1.z.number().describe("User ID"),
    name: zod_1.z.string().describe("User full name"),
    email: zod_1.z.string().email().describe("User email"),
});
const ItemSchema = zod_1.z.object({
    id: zod_1.z.number().describe("Item ID"),
    title: zod_1.z.string().describe("Item title"),
    description: zod_1.z.string().describe("Item description"),
    userId: zod_1.z.number().describe("ID of the user who owns the item"),
});
const UsersSchema = zod_1.z.array(UserSchema).describe("Array of users");
const ItemsSchema = zod_1.z.array(ItemSchema).describe("Array of items");
const MessageSchema = zod_1.z.object({
    message: zod_1.z.string(),
});
// Register routes for OpenAPI generation. These handlers are no-ops because the
// actual implementation is in the main application; this app is only used to
// generate OpenAPI metadata.
const noopHandler = async (c) => c.text("", 204);
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "get",
    path: "/health",
    tag: "Health",
    summary: "Check API health",
    responseSchema: zod_1.z.object({ status: zod_1.z.string().describe("Health status") }),
}), noopHandler);
// Users
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "get",
    path: "/users",
    tag: "Users",
    summary: "Get all users",
    responseSchema: UsersSchema,
}), noopHandler);
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "get",
    path: "/users/{id}",
    tag: "Users",
    summary: "Get a user by ID",
    paramSchema: zod_1.z.object({ id: zod_1.z.string().describe("User ID") }),
    responseSchema: UserSchema,
    responses: {
        404: { description: "User not found", content: { "application/json": { schema: MessageSchema } } },
    },
}), noopHandler);
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "post",
    path: "/users",
    tag: "Users",
    summary: "Create a new user",
    requestSchema: users_dto_js_1.CreateUserDTO,
    responses: {
        201: { description: "Created", content: { "application/json": { schema: UserSchema } } },
    },
}), noopHandler);
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "put",
    path: "/users/{id}",
    tag: "Users",
    summary: "Update an existing user",
    paramSchema: zod_1.z.object({ id: zod_1.z.string().describe("User ID") }),
    requestSchema: users_dto_js_1.UpdateUserDTO,
    responses: {
        404: { description: "User not found", content: { "application/json": { schema: MessageSchema } } },
    },
}), noopHandler);
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "delete",
    path: "/users/{id}",
    tag: "Users",
    summary: "Delete a user",
    paramSchema: zod_1.z.object({ id: zod_1.z.string().describe("User ID") }),
    responseSchema: MessageSchema,
}), noopHandler);
// Items
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "get",
    path: "/items",
    tag: "Items",
    summary: "Get all items",
    responseSchema: ItemsSchema,
}), noopHandler);
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "post",
    path: "/items",
    tag: "Items",
    summary: "Create a new item",
    requestSchema: items_dto_js_1.createItemDto,
    responses: {
        201: { description: "Created", content: { "application/json": { schema: ItemSchema } } },
    },
}), noopHandler);
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "put",
    path: "/items/{id}",
    tag: "Items",
    summary: "Update an existing item",
    paramSchema: zod_1.z.object({ id: zod_1.z.string().describe("Item ID") }),
    requestSchema: items_dto_js_1.updateItemDto,
    responses: {
        404: { description: "Item not found", content: { "application/json": { schema: MessageSchema } } },
    },
}), noopHandler);
openapi.openapi((0, scalargen_js_1.createAutoRoute)({
    method: "delete",
    path: "/items/{id}",
    tag: "Items",
    summary: "Delete an item",
    paramSchema: zod_1.z.object({ id: zod_1.z.string().describe("Item ID") }),
    responseSchema: MessageSchema,
}), noopHandler);
exports.docsApp = new hono_1.Hono();
exports.docsApp.get("/openapi.json", (c) => c.json(openapi.getOpenAPIDocument(OPENAPI_DOCUMENT_CONFIG)));
exports.docsApp.get("/", (0, hono_api_reference_1.Scalar)({
    pageTitle: "My App API Docs",
    sources: [
        {
            name: "My App API",
            url: "/docs/openapi.json",
        },
    ],
}));
//# sourceMappingURL=openapi.js.map