import { Router } from 'express'
import { queryAll } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Get activity logs (protected)
router.get('/', authMiddleware, (_req, res) => {
  const logs = queryAll('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100')
  res.json(logs)
})

export default router
