"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRepository = void 0;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.usersRepository = {
    getAll: () => client_1.db.select().from(schema_1.users),
    getById: (id) => client_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)),
    create: ({ name, email }) => client_1.db.insert(schema_1.users).values({ name, email }).returning(),
    update: (id, data) => client_1.db.update(schema_1.users).set(data).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).returning(),
    delete: (id) => client_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)),
};
//# sourceMappingURL=users.repository.js.map