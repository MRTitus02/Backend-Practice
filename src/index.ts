import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { healthController } from './controllers/health.controller';
import { itemsController } from "./controllers/items.controller";

const app = new Hono()

app.route('/health', healthController)

app.get('/', (c) => {
  return c.text('Hono API running 🚀')
})
app.get("/items", itemsController.getAll);
app.post("/items", itemsController.create);
app.put("/items/:id", itemsController.update);
app.delete("/items/:id", itemsController.delete);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
