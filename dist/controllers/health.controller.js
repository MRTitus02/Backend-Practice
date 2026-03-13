"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const hono_1 = require("hono");
exports.healthController = new hono_1.Hono();
exports.healthController.get("/", (c) => {
    return c.json({
        status: "ok",
        message: "Server is running",
    });
});
//# sourceMappingURL=health.controller.js.map