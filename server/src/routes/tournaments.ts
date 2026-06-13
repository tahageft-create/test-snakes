import { Router } from 'express'
import { queryAll, queryOne, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { notifyAll } from '../services/notificationService.js'

const router = Router()

// Get all tournaments
router.get('/', (req, res) => {
  const status = req.query.status as string
  let tournaments: any[]

  if (status) {
    const statuses = status.split(',')
    const placeholders = statuses.map(() => '?').join(',')
    tournaments = queryAll(`SELECT * FROM tournaments WHERE status IN (${placeholders}) ORDER BY start_date ASC`, statuses)
  } else {
    tournaments = queryAll('SELECT * FROM tournaments ORDER BY start_date DESC')
  }

  res.json(tournaments)
})

// Get single tournament
router.get('/:id', (req, res) => {
  const tournament = queryOne('SELECT * FROM tournaments WHERE id = ?', [req.params.id])
  if (!tournament) return res.status(404).json({ message: 'Tournament not found' })

  const participants = queryAll('SELECT username, created_at FROM tournament_registrations WHERE tournament_id = ?', [req.params.id])
  res.json({ ...tournament, participants })
})

// Register for tournament
router.post('/:id/register', (req, res) => {
  const { username } = req.body
  const { id } = req.params

  if (!username) return res.status(400).json({ message: 'Username is required' })

  const tournament = queryOne('SELECT * FROM tournaments WHERE id = ?', [id]) as any
  if (!tournament) return res.status(404).json({ message: 'Tournament not found' })
  if (tournament.status === 'completed') return res.status(400).json({ message: 'Tournament has ended' })
  if (tournament.current_participants >= tournament.max_participants) return res.status(400).json({ message: 'Tournament is full' })

  const existing = queryOne('SELECT * FROM tournament_registrations WHERE tournament_id = ? AND username = ?', [id, username])
  if (existing) return res.status(400).json({ message: 'Already registered' })

  run('INSERT INTO tournament_registrations (tournament_id, username) VALUES (?, ?)', [id, username])
  run('UPDATE tournaments SET current_participants = current_participants + 1 WHERE id = ?', [id])

  res.json({ message: 'Registered successfully' })
})

// Create tournament (protected)
router.post('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { name, game, description, prize_pool, start_date, end_date, max_participants, rules, bracket_image } = req.body
  if (!name || !game || !description || !start_date || !end_date) {
    return res.status(400).json({ message: 'Name, game, description, start_date, and end_date are required' })
  }

  const result = run(
    'INSERT INTO tournaments (name, game, description, prize_pool, start_date, end_date, max_participants, rules, bracket_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, game, description, prize_pool || '', start_date, end_date, max_participants || 32, rules || '', bracket_image || '']
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Created tournament', name])

  notifyAll({
    type: 'tournament_created',
    title: '🏟️ New Tournament!',
    message: `A new "${name}" tournament for ${game} is open! Prize pool: ${prize_pool || 'TBD'}`,
    link: '/tournaments',
  })

  res.status(201).json({ id: result.lastInsertRowid, message: 'Tournament created' })
})

// Update tournament (protected)
router.put('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { name, game, description, prize_pool, start_date, end_date, status, max_participants, rules, bracket_image } = req.body
  const { id } = req.params

  const existing = queryOne('SELECT * FROM tournaments WHERE id = ?', [id])
  if (!existing) return res.status(404).json({ message: 'Tournament not found' })

  run(
    'UPDATE tournaments SET name = COALESCE(?, name), game = COALESCE(?, game), description = COALESCE(?, description), prize_pool = COALESCE(?, prize_pool), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), status = COALESCE(?, status), max_participants = COALESCE(?, max_participants), rules = COALESCE(?, rules), bracket_image = COALESCE(?, bracket_image) WHERE id = ?',
    [name || null, game || null, description || null, prize_pool || null, start_date || null, end_date || null, status || null, max_participants ?? null, rules || null, bracket_image ?? null, id]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Updated tournament', name || `Tournament #${id}`])
  res.json({ message: 'Tournament updated' })
})

// Delete tournament (protected)
router.delete('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { id } = req.params
  const existing = queryOne('SELECT * FROM tournaments WHERE id = ?', [id]) as any
  if (!existing) return res.status(404).json({ message: 'Tournament not found' })

  run('DELETE FROM tournament_registrations WHERE tournament_id = ?', [id])
  run('DELETE FROM tournaments WHERE id = ?', [id])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Deleted tournament', existing.name])
  res.json({ message: 'Tournament deleted' })
})

export default router
