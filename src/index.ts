import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { healthController } from './controllers/health.controller';
import { itemsController } from "./controllers/items.controller";
import { usersController } from './controllers/users.controller';
import { docsApp } from './docs/openapi';
import { createAutoRoute } from './utils/scalargen.js';

const app = new Hono()

app.route('/health', healthController)

app.get('/', (c) => {
  return c.text('Hono API running 🚀')
})

// Users CRUD
app.get("/users", usersController.getAll);
app.get("/users/:id", usersController.getById);
app.post("/users", usersController.create);
app.put("/users/:id", usersController.update);
app.delete("/users/:id", usersController.delete);

// Items CRUD
app.get("/items", itemsController.getAll);
app.post("/items", itemsController.create);
app.put("/items/:id", itemsController.update);
app.delete("/items/:id", itemsController.delete);

app.route("/docs", docsApp);
app.route("/docs/*", docsApp);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
