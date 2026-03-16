import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import scheduleRoutes from './routes/schedule.routes'
import monthlyRoutes from './routes/monthly.routes'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://minhacadencia.com',
    'https://www.minhacadencia.com',
  ],
}))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/auth', authRoutes)
app.use('/', scheduleRoutes)
app.use('/', monthlyRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
})
