// Load environment variables FIRST
import 'dotenv/config'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import standardsRouter from './routers/standards.router'
import controlsRouter from './routers/controls.router'
import evidenceRouter from './routers/evidence.router'
import authRouter from './routers/auth.router'
import wikiRouter from './routers/wiki.router'
import tagsRouter from './routers/tags.router'

import { authMiddleware } from './middleware/auth.middleware'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4321',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposeHeaders: ['Set-Cookie'],
}))

// Public routes (GET only for now - development mode)
// In production, you should implement proper authentication

app.get('/', (c) => {
  return c.json({ message: 'Allware Wiki API is running!' })
})


// Protected routes middleware
app.use('/api/standards/*', authMiddleware);
app.use('/api/controls/*', authMiddleware);
app.use('/api/evidence/*', authMiddleware);
app.use('/api/tags/*', authMiddleware);
app.use('/api/wiki/*', authMiddleware);

app.route('/api/standards', standardsRouter)
app.route('/api/controls', controlsRouter)
app.route('/api/evidence', evidenceRouter)
app.route('/api/auth', authRouter)
app.route('/api/wiki', wikiRouter)
app.route('/api/tags', tagsRouter)

console.log('\n🚀 Allware Wiki API')
console.log('📍 Local:   http://localhost:3000')
console.log('📍 Network: http://localhost:3000')
console.log('\n✅ Server is ready!\n')

serve({
  fetch: app.fetch,
  port: 3000,
})
