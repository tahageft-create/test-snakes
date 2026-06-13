import { Router } from 'express'
import { queryAll, queryOne, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { notifyAll } from '../services/notificationService.js'

const router = Router()

// Get events
router.get('/', (req, res) => {
  const status = req.query.status as string
  let events: any[]

  if (status) {
    const statuses = status.split(',')
    const placeholders = statuses.map(() => '?').join(',')
    events = queryAll(`SELECT * FROM events WHERE status IN (${placeholders}) ORDER BY date ASC`, statuses)
  } else {
    events = queryAll('SELECT * FROM events ORDER BY date DESC')
  }

  res.json(events)
})

// Register for event
router.post('/:id/register', (req, res) => {
  const { username } = req.body
  const { id } = req.params

  if (!username) return res.status(400).json({ message: 'Username is required' })

  const event = queryOne('SELECT * FROM events WHERE id = ?', [id]) as any
  if (!event) return res.status(404).json({ message: 'Event not found' })
  if (event.status === 'ended') return res.status(400).json({ message: 'Event has ended' })

  const existing = queryOne('SELECT * FROM event_registrations WHERE event_id = ? AND username = ?', [id, username])
  if (existing) return res.status(400).json({ message: 'Already registered' })

  run('INSERT INTO event_registrations (event_id, username) VALUES (?, ?)', [id, username])

  res.json({ message: 'Registered successfully' })
})

// Create event (protected)
router.post('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { title, description, date, image } = req.body

  if (!title || !description || !date) {
    return res.status(400).json({ message: 'Title, description, and date are required' })
  }

  const result = run('INSERT INTO events (title, description, date, image) VALUES (?, ?, ?, ?)', [title, description, date, image || ''])

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Created event', title])

  notifyAll({
    type: 'event_created',
    title: '📅 New Event!',
    message: `A new event "${title}" has been scheduled!`,
    link: '/events',
  })

  res.status(201).json({ id: result.lastInsertRowid, message: 'Event created' })
})

// Update event (protected)
router.put('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { title, description, date, status, image } = req.body
  const { id } = req.params

  const existing = queryOne('SELECT * FROM events WHERE id = ?', [id])
  if (!existing) {
    return res.status(404).json({ message: 'Event not found' })
  }

  run(
    'UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description), date = COALESCE(?, date), status = COALESCE(?, status), image = COALESCE(?, image) WHERE id = ?',
    [title || null, description || null, date || null, status || null, image ?? null, id]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Updated event', title || `Event #${id}`])

  res.json({ message: 'Event updated' })
})

// Delete event (protected)
router.delete('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { id } = req.params

  const existing = queryOne('SELECT * FROM events WHERE id = ?', [id]) as any
  if (!existing) {
    return res.status(404).json({ message: 'Event not found' })
  }

  run('DELETE FROM events WHERE id = ?', [id])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Deleted event', existing.title])

  res.json({ message: 'Event deleted' })
})

export default router
