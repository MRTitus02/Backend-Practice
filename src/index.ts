import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { healthController } from './controllers/health.controller.js'

const app = new Hono()

app.route('/health', healthController)

app.get('/', (c) => {
  return c.text('Hono API running 🚀')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
