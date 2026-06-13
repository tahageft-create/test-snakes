import { Router } from 'express'
import { queryAll, queryOne, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()

function safeJsonParse(str: string): any {
  try { return JSON.parse(str) } catch { return {} }
}

// Get all team members
router.get('/', (req, res) => {
  const category = req.query.category as string
  let members: any[]

  if (category) {
    members = queryAll('SELECT * FROM team_members WHERE category = ? ORDER BY display_order ASC', [category])
  } else {
    members = queryAll('SELECT * FROM team_members ORDER BY display_order ASC')
  }

  // Parse socials JSON
  const parsed = members.map((m: any) => ({
    ...m,
    socials: typeof m.socials === 'string' ? safeJsonParse(m.socials) : (m.socials || {})
  }))

  res.json(parsed)
})

// Get single team member
router.get('/:id', (req, res) => {
  const member = queryOne('SELECT * FROM team_members WHERE id = ?', [req.params.id])
  if (!member) return res.status(404).json({ message: 'Team member not found' })
  res.json({
    ...member,
    socials: typeof (member as any).socials === 'string' ? safeJsonParse((member as any).socials) : (member as any).socials
  })
})

// Create team member (protected)
router.post('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { username, role, description, avatar, socials, category, display_order } = req.body
  if (!username || !role) return res.status(400).json({ message: 'Username and role are required' })

  const result = run(
    'INSERT INTO team_members (username, role, description, avatar, socials, category, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, role, description || '', avatar || '', JSON.stringify(socials || {}), category || 'moderator', display_order || 0]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Added team member', username])
  res.status(201).json({ id: result.lastInsertRowid, message: 'Team member added' })
})

// Update team member (protected)
router.put('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { username, role, description, avatar, socials, category, display_order } = req.body
  const { id } = req.params

  const existing = queryOne('SELECT * FROM team_members WHERE id = ?', [id])
  if (!existing) return res.status(404).json({ message: 'Team member not found' })

  const socialsStr = socials ? JSON.stringify(socials) : null

  run(
    'UPDATE team_members SET username = COALESCE(?, username), role = COALESCE(?, role), description = COALESCE(?, description), avatar = COALESCE(?, avatar), socials = COALESCE(?, socials), category = COALESCE(?, category), display_order = COALESCE(?, display_order) WHERE id = ?',
    [username || null, role || null, description || null, avatar || null, socialsStr, category || null, display_order ?? null, id]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Updated team member', username || `Member #${id}`])
  res.json({ message: 'Team member updated' })
})

// Delete team member (protected)
router.delete('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { id } = req.params
  const existing = queryOne('SELECT * FROM team_members WHERE id = ?', [id]) as any
  if (!existing) return res.status(404).json({ message: 'Team member not found' })

  run('DELETE FROM team_members WHERE id = ?', [id])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Removed team member', existing.username])
  res.json({ message: 'Team member removed' })
})

export default router
