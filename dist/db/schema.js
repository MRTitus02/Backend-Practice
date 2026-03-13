"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.items = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Users table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
});
// Items table
exports.items = (0, pg_core_1.pgTable)("items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    userId: (0, pg_core_1.serial)("user_id").references(() => exports.users.id),
});
//# sourceMappingURL=schema.js.map