import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { healthController } from "./controllers/health.controller";
import { itemsController } from "./controllers/items.controller";
import { usersController } from "./controllers/users.controller";
import { authController } from "./controllers/auth.controller";
import { authMiddleware } from "./middleware/auth";
import { mailController } from "./controllers/mail.controller";
import { docsApp } from "./docs/openapi";
import { createAutoRoute } from "./utils/scalargen.js";
import { startMailWorker } from "./workers/mailWorker";

dotenv.config();

export const app = new Hono();

app.route('/health', healthController)

app.get('/', (c) => {
  return c.text('Hono API running 🚀')
})

// Auth
app.post("/auth/register", authController.register);
app.post("/auth/login", authController.login);
app.post("/auth/refresh", authController.refresh);

// Mail (protected)
app.post("/mail/send", authMiddleware.authenticate, mailController.send);

// Users CRUD (protected)
app.use("/users/*", authMiddleware.authenticate);
app.use("/users", authMiddleware.authenticate);
app.get("/users", usersController.getAll);
app.get("/users/:id", usersController.getById);
app.post("/users", usersController.create);
app.put("/users/:id", usersController.update);
app.delete("/users/:id", usersController.delete);

// Items CRUD (protected)
app.use("/items/*", authMiddleware.authenticate);
app.use("/items", authMiddleware.authenticate);
app.get("/items", itemsController.getAll);
app.post("/items", itemsController.create);
app.put("/items/:id", itemsController.update);
app.delete("/items/:id", itemsController.delete);

app.route("/docs", docsApp);
app.route("/docs/*", docsApp);

export const startServer = (port = 3000) =>
  serve({
    fetch: app.fetch,
    port,
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  });

if (process.env.NODE_ENV !== "test") {
  startServer();
  const intervalMs = Number(process.env.MAIL_WORKER_INTERVAL_MS) || 10_000;
  startMailWorker(intervalMs);
}
