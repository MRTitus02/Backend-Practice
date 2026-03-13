"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateItemDto = exports.createItemDto = void 0;
const zod_1 = require("zod");
exports.createItemDto = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    userId: zod_1.z.number()
});
exports.updateItemDto = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional()
});
//# sourceMappingURL=items.dto.js.map