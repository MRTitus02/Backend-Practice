"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsService = void 0;
const items_repositories_1 = require("../repositories/items.repositories");
exports.itemsService = {
    async getAll() {
        return items_repositories_1.itemsRepository.getAll();
    },
    async create(data) {
        const [item] = await items_repositories_1.itemsRepository.create(data);
        return item;
    },
    async update(id, data) {
        const [updated] = await items_repositories_1.itemsRepository.update(id, data);
        return updated;
    },
    async delete(id) {
        return items_repositories_1.itemsRepository.delete(id);
    }
};
//# sourceMappingURL=items.service.js.map