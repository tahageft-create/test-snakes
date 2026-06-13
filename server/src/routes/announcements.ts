import { Router } from 'express'
import { queryAll, queryOne, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { notifyAll } from '../services/notificationService.js'

const router = Router()

// Get announcements
router.get('/', (req, res) => {
  const pinned = req.query.pinned as string

  let announcements: any[]
  if (pinned === 'true') {
    announcements = queryAll('SELECT * FROM announcements WHERE pinned = 1 ORDER BY created_at DESC')
  } else {
    announcements = queryAll('SELECT * FROM announcements ORDER BY pinned DESC, created_at DESC')
  }

  res.json(announcements.map(a => ({
    ...a,
    pinned: !!(a as any).pinned,
  })))
})

// Create announcement (protected)
router.post('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { title, content } = req.body

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' })
  }

  const result = run('INSERT INTO announcements (title, content, author) VALUES (?, ?, ?)', [title, content, req.user.username])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Created announcement', title])

  notifyAll({
    type: 'announcement',
    title: '📢 New Announcement',
    message: `${title}`,
    link: '/',
  })

  res.status(201).json({ id: result.lastInsertRowid, message: 'Announcement created' })
})

// Delete announcement (protected)
router.delete('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { id } = req.params

  const existing = queryOne('SELECT * FROM announcements WHERE id = ?', [id]) as any
  if (!existing) {
    return res.status(404).json({ message: 'Announcement not found' })
  }

  run('DELETE FROM announcements WHERE id = ?', [id])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Deleted announcement', existing.title])

  res.json({ message: 'Announcement deleted' })
})

export default router
