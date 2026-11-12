import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

import healthRoutes from './routes/health.routes.js'
import humanizerRoutes from './routes/humanizer.routes.js'

import requireAuth from './middleware/requireAuth.js'
import notFound from './middleware/notFound.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

app.use(helmet())

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
]

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Origin not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}))

app.use(express.json({ limit: '1mb' }))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
})

app.use('/api', apiLimiter)

app.use('/api/health', healthRoutes)
app.use('/api/humanizer', requireAuth, humanizerRoutes)

app.use(notFound)
app.use(errorHandler)

export default app