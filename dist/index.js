"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const health_controller_1 = require("./controllers/health.controller");
const items_controller_1 = require("./controllers/items.controller");
const users_controller_1 = require("./controllers/users.controller");
const openapi_1 = require("./docs/openapi");
const app = new hono_1.Hono();
app.route('/health', health_controller_1.healthController);
app.get('/', (c) => {
    return c.text('Hono API running 🚀');
});
// Users CRUD
app.get("/users", users_controller_1.usersController.getAll);
app.get("/users/:id", users_controller_1.usersController.getById);
app.post("/users", users_controller_1.usersController.create);
app.put("/users/:id", users_controller_1.usersController.update);
app.delete("/users/:id", users_controller_1.usersController.delete);
// Items CRUD
app.get("/items", items_controller_1.itemsController.getAll);
app.post("/items", items_controller_1.itemsController.create);
app.put("/items/:id", items_controller_1.itemsController.update);
app.delete("/items/:id", items_controller_1.itemsController.delete);
// Serve Scalar API documentation at /docs
app.route("/docs", openapi_1.docsApp);
app.route("/docs/*", openapi_1.docsApp); // allow nested asset paths if needed
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
//# sourceMappingURL=index.js.map