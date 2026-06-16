import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { trainingsRouter } from './routes/trainings'
import { eventsRouter } from './routes/events'
import { progressRouter } from './routes/progress'
import { vivaLearningRouter } from './routes/vivaLearning'
import { chatRouter } from './routes/chat'
import { adminRouter } from './routes/admin'
import { profileRouter } from './routes/profile'

const app = express()
const PORT = Number(process.env.PORT ?? 4000)

// ── Middleware ──────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,https://dweiner79.github.io').split(',')
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server) or from allowed list
      if (!origin || allowedOrigins.includes(origin)) callback(null, true)
      else callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(express.json())

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/trainings', trainingsRouter)
app.use('/api/events', eventsRouter)
app.use('/api/progress', progressRouter)
app.use('/api/viva-learning', vivaLearningRouter)
app.use('/api/chat', chatRouter)
app.use('/api/admin', adminRouter)
app.use('/api/profile', profileRouter)

// ── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})

export default app
