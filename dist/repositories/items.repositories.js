"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsRepository = void 0;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.itemsRepository = {
    getAll: () => client_1.db.select().from(schema_1.items),
    create: ({ title, description, userId }) => client_1.db.insert(schema_1.items).values({ title, description, userId }).returning(),
    update: (id, data) => client_1.db.update(schema_1.items)
        .set(data)
        .where((0, drizzle_orm_1.eq)(schema_1.items.id, id))
        .returning(),
    delete: (id) => client_1.db.delete(schema_1.items)
        .where((0, drizzle_orm_1.eq)(schema_1.items.id, id))
};
//# sourceMappingURL=items.repositories.js.map