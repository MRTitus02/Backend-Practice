"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const users_repository_1 = require("../repositories/users.repository");
exports.usersService = {
    async getAll() {
        return users_repository_1.usersRepository.getAll();
    },
    async getById(id) {
        const [user] = await users_repository_1.usersRepository.getById(id);
        return user;
    },
    async create(data) {
        const [user] = await users_repository_1.usersRepository.create(data);
        return user;
    },
    async update(id, data) {
        const [user] = await users_repository_1.usersRepository.update(id, data);
        return user;
    },
    async delete(id) {
        return users_repository_1.usersRepository.delete(id);
    },
};
//# sourceMappingURL=users.service.js.map