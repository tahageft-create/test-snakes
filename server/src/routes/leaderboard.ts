import { Router } from 'express'
import { queryAll, queryOne, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()

// Get leaderboard
router.get('/', (req, res) => {
  const type = req.query.type as string || 'chat'

  let rows: any[]
  if (type === 'voice') {
    rows = queryAll('SELECT id, username, voice_xp as xp, voice_level as level, voice_rank as rank FROM members ORDER BY voice_xp DESC LIMIT 50')
  } else {
    rows = queryAll('SELECT id, username, chat_xp as xp, chat_level as level, chat_rank as rank FROM members ORDER BY chat_xp DESC LIMIT 50')
  }

  const leaderboard = rows.map((row: any) => ({
    ...row,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=1e293b&color=22c55e&size=40`,
    rankColor: getRankColor(row.rank as string),
  }))

  res.json(leaderboard)
})

// Get all members with full XP data (admin)
router.get('/admin', authMiddleware, requireRole('owner', 'developer', 'admin'), (req, res) => {
  const search = req.query.search as string
  let rows: any[]
  if (search) {
    rows = queryAll('SELECT * FROM members WHERE username LIKE ? ORDER BY chat_xp DESC', [`%${search}%`])
  } else {
    rows = queryAll('SELECT * FROM members ORDER BY chat_xp DESC')
  }
  res.json(rows)
})

// Update member XP (admin)
router.put('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { id } = req.params
  const { voice_xp, chat_xp, voice_level, chat_level, voice_rank, chat_rank, username } = req.body

  const existing = queryOne('SELECT * FROM members WHERE id = ?', [id])
  if (!existing) return res.status(404).json({ message: 'Member not found' })

  run(
    `UPDATE members SET 
      voice_xp = COALESCE(?, voice_xp),
      chat_xp = COALESCE(?, chat_xp),
      voice_level = COALESCE(?, voice_level),
      chat_level = COALESCE(?, chat_level),
      voice_rank = COALESCE(?, voice_rank),
      chat_rank = COALESCE(?, chat_rank),
      username = COALESCE(?, username)
    WHERE id = ?`,
    [
      voice_xp ?? null,
      chat_xp ?? null,
      voice_level ?? null,
      chat_level ?? null,
      voice_rank || null,
      chat_rank || null,
      username || null,
      id,
    ]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [
    req.user.username,
    'Updated member XP',
    `Member #${id}: voice_xp=${voice_xp ?? 'unchanged'}, chat_xp=${chat_xp ?? 'unchanged'}`
  ])

  res.json({ message: 'Member updated' })
})

// Delete member (admin)
router.delete('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { id } = req.params
  const existing = queryOne('SELECT * FROM members WHERE id = ?', [id]) as any
  if (!existing) return res.status(404).json({ message: 'Member not found' })

  run('DELETE FROM members WHERE id = ?', [id])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Deleted member', existing.username])
  res.json({ message: 'Member deleted' })
})

// Add new member (admin)
router.post('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { username, voice_xp, chat_xp, voice_level, chat_level, voice_rank, chat_rank } = req.body
  if (!username) return res.status(400).json({ message: 'Username is required' })

  const result = run(
    'INSERT INTO members (username, voice_xp, chat_xp, voice_level, chat_level, voice_rank, chat_rank) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, voice_xp || 0, chat_xp || 0, voice_level || 1, chat_level || 1, voice_rank || 'None', chat_rank || 'None']
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Added member', username])
  res.status(201).json({ id: result.lastInsertRowid, message: 'Member added' })
})

function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    'Novice': '#94a3b8',
    'Adept': '#22c55e',
    'Sentinel': '#3b82f6',
    'Elite': '#8b5cf6',
    'Expert': '#f59e0b',
    'Archon': '#ef4444',
    'Explorer': '#94a3b8',
    'Socialite': '#22c55e',
    'Enthusiast': '#8b5cf6',
    'Analyste': '#f59e0b',
  }
  return colors[rank] || '#64748b'
}

export default router
