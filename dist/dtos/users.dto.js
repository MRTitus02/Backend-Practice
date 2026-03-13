"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDTO = exports.CreateUserDTO = void 0;
// dtos/users.dto.ts
const zod_1 = require("zod");
exports.CreateUserDTO = zod_1.z.object({
    name: zod_1.z.string().min(1).describe("User full name"),
    email: zod_1.z.string().email().describe("User email"),
});
exports.UpdateUserDTO = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
});
//# sourceMappingURL=users.dto.js.map