import { Router } from 'express'
import { queryAll, queryOne, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()

// Get all games
router.get('/', (req, res) => {
  const category = req.query.category as string
  const featured = req.query.featured as string

  let games: any[]
  if (category) {
    games = queryAll('SELECT * FROM games WHERE category = ? ORDER BY player_count DESC', [category])
  } else if (featured === 'true') {
    games = queryAll('SELECT * FROM games WHERE featured = 1 ORDER BY player_count DESC')
  } else {
    games = queryAll('SELECT * FROM games ORDER BY featured DESC, player_count DESC')
  }

  res.json(games)
})

// Get single game
router.get('/:id', (req, res) => {
  const game = queryOne('SELECT * FROM games WHERE id = ?', [req.params.id])
  if (!game) return res.status(404).json({ message: 'Game not found' })
  res.json(game)
})

// Create game (protected)
router.post('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { name, description, icon, player_count, color, category, featured } = req.body
  if (!name || !description) return res.status(400).json({ message: 'Name and description are required' })

  const result = run(
    'INSERT INTO games (name, description, icon, player_count, color, category, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, icon || '🎮', player_count || 0, color || '#fbbf24', category || 'action', featured || 0]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Added game', name])
  res.status(201).json({ id: result.lastInsertRowid, message: 'Game added' })
})

// Update game (protected)
router.put('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { name, description, icon, player_count, color, category, featured } = req.body
  const { id } = req.params

  const existing = queryOne('SELECT * FROM games WHERE id = ?', [id])
  if (!existing) return res.status(404).json({ message: 'Game not found' })

  run(
    'UPDATE games SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon), player_count = COALESCE(?, player_count), color = COALESCE(?, color), category = COALESCE(?, category), featured = COALESCE(?, featured) WHERE id = ?',
    [name || null, description || null, icon || null, player_count ?? null, color || null, category || null, featured ?? null, id]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Updated game', name || `Game #${id}`])
  res.json({ message: 'Game updated' })
})

// Delete game (protected)
router.delete('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { id } = req.params
  const existing = queryOne('SELECT * FROM games WHERE id = ?', [id]) as any
  if (!existing) return res.status(404).json({ message: 'Game not found' })

  run('DELETE FROM games WHERE id = ?', [id])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Deleted game', existing.name])
  res.json({ message: 'Game deleted' })
})

export default router
