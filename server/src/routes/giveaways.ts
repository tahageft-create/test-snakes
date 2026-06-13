import { Router } from 'express'
import { queryAll, queryOne, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { notifyAll } from '../services/notificationService.js'

const router = Router()

// Get all giveaways
router.get('/', (req, res) => {
  const status = req.query.status as string
  let giveaways: any[]

  if (status) {
    giveaways = queryAll('SELECT * FROM giveaways WHERE status = ? ORDER BY end_date ASC', [status])
  } else {
    giveaways = queryAll('SELECT * FROM giveaways ORDER BY status = "active" DESC, end_date ASC')
  }

  res.json(giveaways)
})

// Get single giveaway
router.get('/:id', (req, res) => {
  const giveaway = queryOne('SELECT * FROM giveaways WHERE id = ?', [req.params.id])
  if (!giveaway) return res.status(404).json({ message: 'Giveaway not found' })

  const participants = queryAll('SELECT username, created_at FROM giveaway_participants WHERE giveaway_id = ?', [req.params.id])
  res.json({ ...giveaway, participantList: participants })
})

// Enter giveaway
router.post('/:id/enter', (req, res) => {
  const { username } = req.body
  const { id } = req.params

  if (!username) return res.status(400).json({ message: 'Username is required' })

  const giveaway = queryOne('SELECT * FROM giveaways WHERE id = ?', [id]) as any
  if (!giveaway) return res.status(404).json({ message: 'Giveaway not found' })
  if (giveaway.status !== 'active') return res.status(400).json({ message: 'Giveaway is not active' })

  const existing = queryOne('SELECT * FROM giveaway_participants WHERE giveaway_id = ? AND username = ?', [id, username])
  if (existing) return res.status(400).json({ message: 'Already entered' })

  run('INSERT INTO giveaway_participants (giveaway_id, username) VALUES (?, ?)', [id, username])
  run('UPDATE giveaways SET participants = participants + 1 WHERE id = ?', [id])

  res.json({ message: 'Entered giveaway successfully' })
})

// Create giveaway (protected)
router.post('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { title, description, prize, end_date, rules } = req.body
  if (!title || !description || !prize || !end_date) {
    return res.status(400).json({ message: 'Title, description, prize, and end_date are required' })
  }

  const result = run(
    'INSERT INTO giveaways (title, description, prize, end_date, rules) VALUES (?, ?, ?, ?, ?)',
    [title, description, prize, end_date, rules || '']
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Created giveaway', title])

  notifyAll({
    type: 'giveaway_created',
    title: '🎉 New Giveaway!',
    message: `A new giveaway "${title}" is live! Prize: ${prize}`,
    link: '/giveaways',
  })

  res.status(201).json({ id: result.lastInsertRowid, message: 'Giveaway created' })
})

// Update giveaway (protected)
router.put('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { title, description, prize, end_date, status, winner, rules } = req.body
  const { id } = req.params

  const existing = queryOne('SELECT * FROM giveaways WHERE id = ?', [id]) as any
  if (!existing) return res.status(404).json({ message: 'Giveaway not found' })

  run(
    'UPDATE giveaways SET title = COALESCE(?, title), description = COALESCE(?, description), prize = COALESCE(?, prize), end_date = COALESCE(?, end_date), status = COALESCE(?, status), winner = COALESCE(?, winner), rules = COALESCE(?, rules) WHERE id = ?',
    [title || null, description || null, prize || null, end_date || null, status || null, winner || null, rules || null, id]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Updated giveaway', title || `Giveaway #${id}`])

  if (winner && !existing.winner) {
    notifyAll({
      type: 'giveaway_winner',
      title: '🏆 Giveaway Winner!',
      message: `The giveaway "${existing.title}" has a winner: ${winner}!`,
      link: '/giveaways',
    })
  }

  res.json({ message: 'Giveaway updated' })
})

// Delete giveaway (protected)
router.delete('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { id } = req.params
  const existing = queryOne('SELECT * FROM giveaways WHERE id = ?', [id]) as any
  if (!existing) return res.status(404).json({ message: 'Giveaway not found' })

  run('DELETE FROM giveaway_participants WHERE giveaway_id = ?', [id])
  run('DELETE FROM giveaways WHERE id = ?', [id])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Deleted giveaway', existing.title])
  res.json({ message: 'Giveaway deleted' })
})

export default router
