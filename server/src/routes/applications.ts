import { Router, Response } from 'express'
import { queryOne, queryAll, run } from '../db/index.js'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js'
import { notifyUser } from '../services/notificationService.js'

const router = Router()

// List all applications (admin+)
router.get('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (_req: AuthRequest, res: Response) => {
  const apps = queryAll('SELECT * FROM staff_applications ORDER BY created_at DESC')
  res.json(apps)
})

// Get current user's applications
router.get('/my', authMiddleware, (req: AuthRequest, res: Response) => {
  const apps = queryAll('SELECT * FROM staff_applications WHERE user_id = ? ORDER BY created_at DESC', [req.user!.id])
  res.json(apps)
})

// Submit application
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { position, age, experience, reason, availability } = req.body

  if (!position || !age || !experience || !reason) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // Check for pending applications
  const pending = queryOne(
    'SELECT id FROM staff_applications WHERE user_id = ? AND status = ?',
    [req.user!.id, 'pending']
  )
  if (pending) {
    return res.status(409).json({ message: 'You already have a pending application' })
  }

  const result = run(
    'INSERT INTO staff_applications (user_id, username, position, age, experience, reason, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user!.id, req.user!.username, position, age, experience, reason, availability || '']
  )

  res.status(201).json({ id: result.lastInsertRowid, message: 'Application submitted' })
})

// Review application (approve/reject)
router.put('/:id/review', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: AuthRequest, res: Response) => {
  const { status, review_note } = req.body
  const appId = parseInt(req.params.id)

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' })
  }

  const app = queryOne('SELECT * FROM staff_applications WHERE id = ?', [appId])
  if (!app) {
    return res.status(404).json({ message: 'Application not found' })
  }

  if (app.status !== 'pending') {
    return res.status(400).json({ message: 'Application already reviewed' })
  }

  run(
    'UPDATE staff_applications SET status = ?, reviewed_by = ?, review_note = ?, reviewed_at = datetime(?) WHERE id = ?',
    [status, req.user!.username, review_note || '', new Date().toISOString(), appId]
  )

  // If approved, upgrade user to staff
  if (status === 'approved' && app.user_id) {
    run('UPDATE users SET role = ? WHERE id = ? AND role = ?', ['staff', app.user_id, 'member'])
  }

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)',
    [req.user!.username, `${status === 'approved' ? 'Approved' : 'Rejected'} application`, app.username])

  if (app.user_id) {
    notifyUser(app.user_id as number, {
      type: status === 'approved' ? 'application_approved' : 'application_rejected',
      title: status === 'approved' ? '✅ Application Approved' : '❌ Application Rejected',
      message: `Your staff application for ${app.position} has been ${status}${review_note ? `: ${review_note}` : ''}`,
      link: '/apply',
    })
  }

  res.json({ message: `Application ${status}` })
})

export default router
